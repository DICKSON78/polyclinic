<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class PerformanceDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request, $department)
    {
        return $this->getDepartmentKPIs($request, $department);
    }

    public function getDepartmentKPIs(Request $request, $department)
    {
        try {
            $request->validate([
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date'   => 'sometimes|date_format:Y-m-d'
            ]);

            $user = $request->user();

            // DEBUG: Log received parameters
            \Log::info('PerformanceDashboard - Received params:', [
                'department' => $department,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'all_params' => $request->all()
            ]);

            $start_date = $request->start_date ?? Carbon::today()->startOfMonth()->format('Y-m-d');
            $end_date   = $request->end_date   ?? Carbon::today()->format('Y-m-d');

            // DEBUG: Log effective date range
            \Log::info('PerformanceDashboard - Effective date range:', [
                'start_date' => $start_date,
                'end_date' => $end_date
            ]);

            if (!$user || $user->is_admin) {
                $clinic_id = $request->clinic_id;
            } else {
                $clinic_id = $user->clinic_id ?? null;
            }

            $kpis    = $this->calculateDepartmentKPIs($department, $clinic_id, $start_date, $end_date);
            $summary = $this->generateSummary($kpis, $department);
            $recommendationsData = $this->generateRecommendations($kpis, $department);

            // Get saved remarks & recommendations from department_reports table
            $existingRemarks = DB::table('department_reports')
                ->where('department', $department)
                ->where('date', $start_date)
                ->value('remarks') ?? '';

            $existingRecommendations = DB::table('department_reports')
                ->where('department', $department)
                ->where('date', $start_date)
                ->value('recommendations') ?? '';

            // Determine edit permission
            $canEdit = $this->userCanEdit($user, $department);

            $data = [
                'department'      => $department,
                'period'          => ['start_date' => $start_date, 'end_date' => $end_date],
                'kpis'            => $kpis,
                'summary'         => $summary,
                'recommendations' => $existingRecommendations ?: $recommendationsData,
                'remarks'         => $existingRemarks,
                'can_edit'        => $canEdit
            ];

            return $this->sendResponse($data, Response::HTTP_OK, 'Performance data retrieved successfully');

        } catch (\Exception $e) {
            Log::error('Performance Dashboard Error: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error retrieving performance data: ' . $e->getMessage());
        }
    }

    /**
     * Update remarks and recommendations for a department report.
     * Allowed: Admin, Director, Optometrist, Manager, or anyone with explicit privilege.
     */
    public function updateReport(Request $request, $department)
    {
        $user = $request->user();

        if (!$user || !$this->userCanEdit($user, $department)) {
            return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Access denied - edit permission required');
        }

        $request->validate([
            'remarks'         => 'nullable|string|max:5000',
            'recommendations' => 'nullable|string|max:5000',
            'date'            => 'sometimes|date_format:Y-m-d'
        ]);

        try {
            $date = $request->date ?? Carbon::today()->startOfMonth()->format('Y-m-d');

            DB::table('department_reports')->updateOrInsert(
                ['department' => $department, 'date' => $date],
                [
                    'remarks'         => $request->remarks,
                    'recommendations' => $request->recommendations,
                    'updated_by'      => $user->id,
                    'updated_at'      => now(),
                    'created_at'      => now(),
                ]
            );

            return $this->sendResponse(null, Response::HTTP_OK, 'Report details updated successfully');

        } catch (\Exception $e) {
            Log::error('Performance Report Update Error: ' . $e->getMessage());
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error updating report details');
        }
    }

    /**
     * Update KPI targets for a department.
     * Accepts targets as {kpi_id: value} object.
     * Allowed: same as updateReport.
     */
    public function updateTargets(Request $request, $department)
    {
        $user = $request->user();

        if (!$user || !$this->userCanEdit($user, $department)) {
            return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Access denied - edit permission required');
        }

        $request->validate([
            'targets'   => 'required|array',
        ]);

        try {
            foreach ($request->targets as $kpiId => $target) {
                // Accept both numeric value directly and array with 'value' key
                $targetValue = is_array($target) ? ($target['value'] ?? 0) : $target;
                $targetValue = is_numeric($targetValue) ? (float) $targetValue : 0;

                if ($targetValue < 0) continue;

                $attributes = [
                    'department' => $department,
                    'kpi_id'     => $kpiId,
                ];

                // Only filter by clinic_id if column exists and user has one
                if (Schema::hasColumn('performance_targets', 'clinic_id') && $user->clinic_id) {
                    $attributes['clinic_id'] = $user->clinic_id;
                }

                DB::table('performance_targets')->updateOrInsert(
                    $attributes,
                    [
                        'target'     => $targetValue,
                        'updated_at' => now(),
                        'updated_by' => $user->id,
                        'created_by' => $user->id,
                        'created_at' => now(),
                    ]
                );
            }

            return $this->sendResponse(null, Response::HTTP_OK, 'Targets updated successfully');

        } catch (\Exception $e) {
            Log::error('Performance Target Update Error: ' . $e->getMessage());
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error updating targets');
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Determine if the user can edit reports/targets for this department.
     */
    private function userCanEdit($user, $department)
    {
        if (!$user) return false;
        if ($user->is_admin || $user->id == 1) return true;

        $role = strtolower(trim($user->role ?? ''));
        if (in_array($role, ['admin', 'director', 'optometrist', 'manager'])) return true;
        if (str_contains($role, 'admin') || str_contains($role, 'director') || str_contains($role, 'optometrist')) return true;

        // Check explicit privilege
        $privileges = $user->privileges ?? null;
        $privArray  = is_object($privileges) ? (array) $privileges : (is_array($privileges) ? $privileges : []);
        $checkedDept = $department === 'marketing' ? 'crm' : $department;

        return !empty($privArray["{$checkedDept}_report_card"]);
    }

    private function calculateDepartmentKPIs($department, $clinic_id, $start_date, $end_date)
    {
        switch (strtolower($department)) {
            case 'optometry': return $this->getOptometryKPIs($clinic_id, $start_date, $end_date);
            case 'sales':     return $this->getSalesKPIs($clinic_id, $start_date, $end_date);
            case 'crm':
            case 'marketing': return $this->getCRMKPIs($clinic_id, $start_date, $end_date);
            default:          return [];
        }
    }

    private function getOptometryKPIs($clinic_id, $start_date, $end_date)
    {
        // DEBUG: Log method call with parameters
        \Log::info('getOptometryKPIs called:', [
            'clinic_id' => $clinic_id,
            'start_date' => $start_date,
            'end_date' => $end_date
        ]);

        // Return Patient % (Monthly)
        $totalPatients = DB::table('patient_check_ins as pci')
            ->join('users as u', 'pci.created_by', '=', 'u.id')
            ->when($clinic_id, fn($q) => $q->where('u.clinic_id', $clinic_id))
            ->whereDate('pci.created_at', '>=', $start_date)
            ->whereDate('pci.created_at', '<=', $end_date)
            ->count();

        $returnPatients = DB::table('patient_check_ins as pci')
            ->join('patients as p', 'pci.patient_id', '=', 'p.id')
            ->join('users as u', 'pci.created_by', '=', 'u.id')
            ->where('pci.created_at', '<', Carbon::parse($start_date))
            ->when($clinic_id, fn($q) => $q->where('u.clinic_id', $clinic_id))
            ->whereIn('p.id', function ($q) use ($start_date, $end_date, $clinic_id) {
                $q->select('pci.patient_id')
                  ->from('patient_check_ins as pci')
                  ->join('users as u', 'pci.created_by', '=', 'u.id')
                  ->whereDate('pci.created_at', '>=', $start_date)
                  ->whereDate('pci.created_at', '<=', $end_date)
                  ->when($clinic_id, fn($q2) => $q2->where('u.clinic_id', $clinic_id));
            })
            ->count();

        $returnPatientPct = $totalPatients > 0 ? round(($returnPatients / $totalPatients) * 100, 1) : 0;
        $returnPatientTarget = $this->getTarget('optometry', 'return_patient_percentage', $clinic_id);

        // Get only specific medicines for Optometry Report Card (using actual database names)
        $targetMedicines = [
            'Carofit (Multi vitamins)', 
            'LOTEL', 
            'OLOPAT OD (Olopatadine hydrochloride 0.2%)', 
            'Softdrops (lubricating eye drop)', 
            'Levofloxacin', 
            'PROBETA N (Betamethasone+Neomycin)'
        ];
        
        $medicineKPIs = [];
        foreach ($targetMedicines as $medicine) {
            $sales = DB::table('patient_payment_cache_items as ppci')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('items as i', 'ppci.item_id', '=', 'i.id')
                ->join('users as u', 'ppci.created_by', '=', 'u.id')
                ->where('i.name', $medicine)
                ->where('ppci.status', 'Paid')
                ->when($clinic_id, fn($q) => $q->where('u.clinic_id', $clinic_id))
                ->whereDate('ppc.created_at', '>=', $start_date)
                ->whereDate('ppc.created_at', '<=', $end_date)
                ->sum('ppci.quantity');

            $target = $this->getTarget('optometry', md5($medicine), $clinic_id) ?: 50; // Default target 50 units

            // DEBUG: Log individual medicine calculation
            \Log::info("Medicine calculation for {$medicine}:", [
                'sales' => $sales,
                'target' => $target,
                'date_range' => "{$start_date} to {$end_date}"
            ]);

            $medicineKPIs[] = [
                'id' => md5($medicine),
                'name' => $medicine,
                'target' => $target,
                'result' => (int) $sales,
                'formatted_target' => number_format($target) . ' units',
                'formatted_result' => number_format($sales) . ' units',
                'unit' => 'units',
            ];
        }

        return array_merge($medicineKPIs, [
            [
                'id'               => 'return_patient_percentage',
                'name'             => 'Return patient (monthly data in % compared to new patient, target is 50%)',
                'target'           => $returnPatientTarget,
                'result'           => $returnPatientPct,
                'formatted_target' => number_format($returnPatientTarget, 1) . '%',
                'formatted_result' => $returnPatientPct . '%',
                'unit'             => '%',
                'is_separate_card' => true,
            ],
        ]);
    }

    private function getSalesKPIs($clinic_id, $start_date, $end_date)
    {
        // Average Glass Daily Sales
        $glassSales = DB::table('patient_payment_cache_items as ppci')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('items as i', 'ppci.item_id', '=', 'i.id')
            ->join('users as u', 'ppci.created_by', '=', 'u.id')
            ->whereIn('i.item_type_id', [3, 4])
            ->where('ppci.status', 'Paid')
            ->when($clinic_id, fn($q) => $q->where('u.clinic_id', $clinic_id))
            ->whereDate('ppc.created_at', '>=', $start_date)
            ->whereDate('ppc.created_at', '<=', $end_date)
            ->sum(DB::raw('ppci.quantity * ppci.unit_price'));

        $glassSalesTarget = $this->getTarget('sales', 'average_glass_daily_sales', $clinic_id);

        // Glass Customer Conversion Ratio
        $totalPatients = DB::table('patient_check_ins as pci')
            ->join('users as u', 'pci.created_by', '=', 'u.id')
            ->when($clinic_id, fn($q) => $q->where('u.clinic_id', $clinic_id))
            ->whereDate('pci.created_at', '>=', $start_date)
            ->whereDate('pci.created_at', '<=', $end_date)
            ->count();

        $glassBuyers = DB::table('patient_payment_cache_items as ppci')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('items as i', 'ppci.item_id', '=', 'i.id')
            ->join('users as u', 'ppci.created_by', '=', 'u.id')
            ->whereIn('i.item_type_id', [3, 4])
            ->where('ppci.status', 'Paid')
            ->when($clinic_id, fn($q) => $q->where('u.clinic_id', $clinic_id))
            ->whereDate('ppc.created_at', '>=', $start_date)
            ->whereDate('ppc.created_at', '<=', $end_date)
            ->distinct('ppci.payment_cache_id')
            ->count();

        $conversionRatio = $totalPatients > 0 ? round(($glassBuyers / $totalPatients) * 100, 1) : 0;
        $conversionTarget = $this->getTarget('sales', 'glass_conversion_ratio', $clinic_id);

        return [
            [
                'id'               => 'average_glass_daily_sales',
                'name'             => 'Average Glass Daily Sales',
                'target'           => $glassSalesTarget,
                'result'           => (float) $glassSales,
                'formatted_target' => 'TZS ' . number_format($glassSalesTarget, 2),
                'formatted_result' => 'TZS ' . number_format($glassSales, 2),
                'unit'             => 'TZS',
            ],
            [
                'id'               => 'glass_conversion_ratio',
                'name'             => 'Glass Customer Conversion Ratio',
                'target'           => $conversionTarget,
                'result'           => $conversionRatio,
                'formatted_target' => number_format($conversionTarget, 1) . '%',
                'formatted_result' => $conversionRatio . '%',
                'unit'             => '%',
            ],
        ];
    }

    private function getCRMKPIs($clinic_id, $start_date, $end_date)
    {
        $contactStatuses = DB::table('patients as p')
            ->leftJoin('patient_calling_statuses as pcs', 'p.id', '=', 'pcs.patient_id')
            ->join('users as u', 'p.created_by', '=', 'u.id')
            ->selectRaw('
                COUNT(CASE WHEN pcs.status = "called" THEN 1 END) as called,
                COUNT(CASE WHEN pcs.status = "need_to_call" OR pcs.status IS NULL THEN 1 END) as not_called,
                COUNT(CASE WHEN pcs.status = "unreachable" THEN 1 END) as unreachable,
                COUNT(*) as total
            ')
            ->when($clinic_id, fn($q) => $q->where('u.clinic_id', $clinic_id))
            ->whereDate('pcs.created_at', '>=', $start_date)
            ->whereDate('pcs.created_at', '<=', $end_date)
            ->first();

        $calledContacts     = (int) ($contactStatuses->called      ?? 0);
        $notCalledContacts  = (int) ($contactStatuses->not_called  ?? 0);
        $unreachableContacts = (int) ($contactStatuses->unreachable ?? 0);

        $glassLeadsCount = 0;
        if (Schema::hasColumn('patients', 'is_glass_prospect')) {
            $glassLeadsCount = DB::table('patients as p')
                ->join('users as u', 'p.created_by', '=', 'u.id')
                ->where('p.is_glass_prospect', true)
                ->when($clinic_id, fn($q) => $q->where('u.clinic_id', $clinic_id))
                ->count();
        }

        $calledTarget       = $this->getTarget('crm', 'called_contacts',      $clinic_id) ?: 100;
        $notCalledTarget    = $this->getTarget('crm', 'not_called_contacts',   $clinic_id) ?: 0;
        $unreachableTarget  = $this->getTarget('crm', 'unreachable_contacts',  $clinic_id) ?: 0;
        $glassLeadsTarget   = $this->getTarget('crm', 'marketing_glass_leads', $clinic_id) ?: 40;

        return [
            [
                'id'               => 'called_contacts',
                'name'             => 'Patient Contact Status - Called',
                'target'           => $calledTarget,
                'result'           => $calledContacts,
                'formatted_target' => number_format($calledTarget),
                'formatted_result' => number_format($calledContacts),
                'unit'             => 'count',
            ],
            [
                'id'               => 'not_called_contacts',
                'name'             => 'Patient Contact Status - Not Called',
                'target'           => $notCalledTarget,
                'result'           => $notCalledContacts,
                'formatted_target' => number_format($notCalledTarget),
                'formatted_result' => number_format($notCalledContacts),
                'unit'             => 'count',
            ],
            [
                'id'               => 'unreachable_contacts',
                'name'             => 'Patient Contact Status - Unreachable',
                'target'           => $unreachableTarget,
                'result'           => $unreachableContacts,
                'formatted_target' => number_format($unreachableTarget),
                'formatted_result' => number_format($unreachableContacts),
                'unit'             => 'count',
            ],
            [
                'id'               => 'marketing_glass_leads',
                'name'             => 'Marketing Glass Leads',
                'target'           => $glassLeadsTarget,
                'result'           => $glassLeadsCount,
                'formatted_target' => number_format($glassLeadsTarget),
                'formatted_result' => number_format($glassLeadsCount),
                'unit'             => 'count',
            ],
        ];
    }

    private function getTarget($department, $kpiId, $clinic_id = null)
    {
        $query = DB::table('performance_targets')
            ->where('department', $department)
            ->where('kpi_id', $kpiId);

        if (Schema::hasColumn('performance_targets', 'clinic_id') && $clinic_id) {
            $query->where('clinic_id', $clinic_id);
        }

        return (float) ($query->value('target') ?? 0);
    }

    private function generateSummary($kpis, $department)
    {
        $achievedCount = 0;
        $totalCount    = 0;
        
        foreach ($kpis as $kpi) {
            // For optometry, exclude return_patient_percentage from summary calculation
            if ($kpi['target'] > 0 && 
                !(strtolower($department) === 'optometry' && $kpi['id'] === 'return_patient_percentage')) {
                $totalCount++;
                if ($kpi['result'] >= $kpi['target']) $achievedCount++;
            }
        }
        
        $rate = $totalCount > 0 ? round(($achievedCount / $totalCount) * 100, 0) : 0;
        return "Achieved {$achievedCount} out of {$totalCount} targets ({$rate}% completion rate).";
    }

    private function generateRecommendations($kpis, $department)
    {
        $recommendations = [];
        foreach ($kpis as $kpi) {
            if ($kpi['target'] > 0 && $kpi['result'] < $kpi['target']) {
                $pct = round(($kpi['result'] / $kpi['target']) * 100, 0);
                switch ($kpi['id']) {
                    case 'medicine_sales':
                        $recommendations[] = "Increase medicine sales — currently at {$pct}% of target.";
                        break;
                    case 'return_patient_percentage':
                        $recommendations[] = "Improve patient retention — return rate at {$pct}% of {$kpi['target']}% target.";
                        break;
                    case 'average_glass_daily_sales':
                        $recommendations[] = "Boost glass daily sales — at {$pct}% of target.";
                        break;
                    case 'glass_conversion_ratio':
                        $recommendations[] = "Improve glass conversion — at {$pct}% of {$kpi['target']}% target.";
                        break;
                    case 'called_contacts':
                        $recommendations[] = "Increase calling efforts — only {$pct}% of contact target reached.";
                        break;
                    case 'marketing_glass_leads':
                        $recommendations[] = "Boost marketing to generate more glass leads — at {$pct}% of target.";
                        break;
                }
            }
        }
        if (empty($recommendations)) {
            return "All targets are being met. Keep up the excellent work!";
        }
        return implode(' ', $recommendations);
    }
}