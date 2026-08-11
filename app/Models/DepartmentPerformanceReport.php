<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class DepartmentPerformanceReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'department', 'report_name', 'report_date', 'kpi_data', 
        'summary', 'recommendations', 'status', 'clinic_id', 'created_by'
    ];

    protected $casts = [
        'report_date' => 'date',
        'kpi_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function auditLogs()
    {
        return $this->hasMany(DepartmentPerformanceAuditLog::class, 'department', 'department');
    }

    /**
     * Get the latest report for a department
     */
    public static function getLatestReport($department, $clinicId = null)
    {
        return self::where('department', $department)
            ->where('status', 'Active')
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('clinic_id', $clinicId);
            })
            ->orderBy('report_date', 'desc')
            ->first();
    }

    /**
     * Generate KPI data for Optometry department
     */
    public static function generateOptometryKPI($clinicId = null, $reportDate = null)
    {
        $reportDate = $reportDate ?? now()->toDateString();
        $startDate = now()->startOfMonth()->toDateString();
        $endDate = now()->endOfMonth()->toDateString();

        // Medicine Sales - confirmed medicine payments
        $medicineSales = DB::table('patient_item_payments as pip')
            ->join('patient_payment_cache_items as ppci', 'pip.id', '=', 'ppci.item_payment_id')
            ->join('items as i', 'ppci.item_id', '=', 'i.id')
            ->join('users as u', 'pip.created_by', '=', 'u.id')
            ->where(function($query) {
                $query->where('i.category', 'Medicine')
                    ->orWhere('i.name', 'like', '%PROBETA N%')
                    ->orWhere('i.name', 'like', '%Betamethasone%')
                    ->orWhere('i.name', 'like', '%Neomycin%');
            })
            ->where('pip.amount', '>', 0)
            ->whereDate('pip.created_at', $reportDate)
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('u.clinic_id', $clinicId);
            })
            ->sum('pip.amount');

        // Return Patient % (Monthly)
        $totalPatients = DB::table('patient_check_ins as pci')
            ->join('users as u', 'pci.created_by', '=', 'u.id')
            ->whereDate('pci.created_at', '>=', $startDate)
            ->whereDate('pci.created_at', '<=', $endDate)
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('u.clinic_id', $clinicId);
            })
            ->distinct('patient_id')
            ->count('patient_id');

        $returningPatients = DB::table('patient_check_ins as pci1')
            ->join('patient_check_ins as pci2', 'pci1.patient_id', '=', 'pci2.patient_id')
            ->join('users as u', 'pci1.created_by', '=', 'u.id')
            ->whereDate('pci1.created_at', '>=', $startDate)
            ->whereDate('pci1.created_at', '<=', $endDate)
            ->whereDate('pci2.created_at', '<', $startDate)
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('u.clinic_id', $clinicId);
            })
            ->distinct('pci1.patient_id')
            ->count('pci1.patient_id');

        $returnPatientPercentage = $totalPatients > 0 
            ? round(($returningPatients / $totalPatients) * 100, 2) 
            : 0;

        // Softdrop Sales - confirmed softdrop payments
        $softdropSales = DB::table('patient_item_payments as pip')
            ->join('patient_payment_cache_items as ppci', 'pip.id', '=', 'ppci.item_payment_id')
            ->join('items as i', 'ppci.item_id', '=', 'i.id')
            ->join('users as u', 'pip.created_by', '=', 'u.id')
            ->where('i.category', 'Softdrop')
            ->where('pip.amount', '>', 0)
            ->whereDate('pip.created_at', $reportDate)
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('u.clinic_id', $clinicId);
            })
            ->sum('pip.amount');

        return [
            'medicine_sales' => [
                'name' => 'Medicine Sales',
                'value' => (float) $medicineSales,
                'unit' => 'currency',
                'target' => DepartmentKpiTarget::getTarget('Optometry', 'Medicine Sales', $clinicId),
            ],
            'softdrop_sales' => [
                'name' => 'Softdrop Sales',
                'value' => (float) $softdropSales,
                'unit' => 'currency',
                'target' => DepartmentKpiTarget::getTarget('Optometry', 'Softdrop Sales', $clinicId),
            ],
            'return_patient_percentage' => [
                'name' => 'Return Patient % (Monthly)',
                'value' => $returnPatientPercentage,
                'unit' => 'percentage',
                'target' => DepartmentKpiTarget::getTarget('Optometry', 'Return Patient % (Monthly)', $clinicId),
            ],
        ];
    }

    /**
     * Generate KPI data for Sales department
     */
    public static function generateSalesKPI($clinicId = null, $reportDate = null)
    {
        $reportDate = $reportDate ?? now()->toDateString();

        // Average Glass Daily Sales - approved outpatient payments (non-Pharmacy, non-Procedure)
        $glassSales = DB::table('patient_item_payments as pip')
            ->join('patient_payment_cache_items as ppci', 'pip.id', '=', 'ppci.item_payment_id')
            ->join('items as i', 'ppci.item_id', '=', 'i.id')
            ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
            ->join('users as u', 'pip.created_by', '=', 'u.id')
            ->whereNotIn('ct.name', ['Pharmacy', 'Procedure'])
            ->where('pip.amount', '>', 0)
            ->whereDate('pip.created_at', $reportDate)
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('u.clinic_id', $clinicId);
            })
            ->sum('pip.amount');

        // Glass Customer Conversion Ratio (Daily)
        $totalAttendingPatients = DB::table('patient_check_ins as pci')
            ->join('users as u', 'pci.created_by', '=', 'u.id')
            ->whereDate('pci.created_at', $reportDate)
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('u.clinic_id', $clinicId);
            })
            ->distinct('patient_id')
            ->count('patient_id');

        $glassBuyers = DB::table('patient_item_payments as pip')
            ->join('patient_payment_cache_items as ppci', 'pip.id', '=', 'ppci.item_payment_id')
            ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
            ->join('users as u', 'pip.created_by', '=', 'u.id')
            ->whereNotIn('ct.name', ['Pharmacy', 'Procedure'])
            ->where('pip.amount', '>', 0)
            ->whereDate('pip.created_at', $reportDate)
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('u.clinic_id', $clinicId);
            })
            ->distinct('ppci.payment_cache_id')
            ->count('ppci.payment_cache_id');

        $conversionRatio = $totalAttendingPatients > 0 
            ? round(($glassBuyers / $totalAttendingPatients) * 100, 2) 
            : 0;

        return [
            'average_glass_daily_sales' => [
                'name' => 'Average Glass Daily Sales',
                'value' => (float) $glassSales,
                'unit' => 'currency',
                'target' => DepartmentKpiTarget::getTarget('Sales', 'Average Glass Daily Sales', $clinicId),
            ],
            'glass_conversion_ratio' => [
                'name' => 'Glass Customer Conversion Ratio (Daily)',
                'value' => $conversionRatio,
                'unit' => 'percentage',
                'target' => DepartmentKpiTarget::getTarget('Sales', 'Glass Customer Conversion Ratio (Daily)', $clinicId),
            ],
        ];
    }

    /**
     * Generate KPI data for CRM department
     */
    public static function generateCrmKPI($clinicId = null, $reportDate = null)
    {
        $reportDate = $reportDate ?? now()->toDateString();

        // Patient Contact Status - using users table to link patients to clinic through creator
        $contactStatuses = DB::table('patients as p')
            ->leftJoin('patient_calling_statuses as pcs', 'p.id', '=', 'pcs.patient_id')
            ->join('users as u', 'p.created_by', '=', 'u.id')
            ->selectRaw('
                COUNT(CASE WHEN pcs.status = "called" THEN 1 END) as called,
                COUNT(CASE WHEN pcs.status = "need_to_call" OR pcs.status IS NULL THEN 1 END) as not_called,
                COUNT(CASE WHEN pcs.status = "unreachable" THEN 1 END) as unreachable,
                COUNT(*) as total
            ')
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('u.clinic_id', $clinicId);
            })
            ->first();

        // Marketing Glass Leads - check if column exists
        $glassLeads = 0;
        if (\Illuminate\Support\Facades\Schema::hasColumn('patients', 'is_glass_prospect')) {
            $glassLeads = DB::table('patients as p')
                ->join('users as u', 'p.created_by', '=', 'u.id')
                ->where('p.is_glass_prospect', true)
                ->when($clinicId, function ($query) use ($clinicId) {
                    $query->where('u.clinic_id', $clinicId);
                })
                ->count();
        }

        return [
            'patient_contact_status' => [
                'name' => 'Patient Contact Status',
                'value' => [
                    'called' => (int) ($contactStatuses->called ?? 0),
                    'not_called' => (int) ($contactStatuses->not_called ?? 0),
                    'unreachable' => (int) ($contactStatuses->unreachable ?? 0),
                    'total' => (int) ($contactStatuses->total ?? 0),
                ],
                'unit' => 'count',
                'target' => DepartmentKpiTarget::getTarget('CRM', 'Patient Contact Status', $clinicId),
            ],
            'marketing_glass_leads' => [
                'name' => 'Marketing Glass Leads',
                'value' => $glassLeads,
                'unit' => 'count',
                'target' => DepartmentKpiTarget::getTarget('CRM', 'Marketing Glass Leads', $clinicId),
            ],
        ];
    }

    /**
     * Calculate performance color based on target vs actual
     */
    public static function calculatePerformanceColor($actual, $target, $unit = 'currency')
    {
        if ($target <= 0) return 'gray'; // No target set

        // Handle case where actual is an array (CRM Contact Status)
        if (is_array($actual)) {
            $actual = (float) ($actual['called'] ?? 0);
        }

        $percentage = ($actual / $target) * 100;

        if ($percentage < 90) {
            return 'yellow'; // Below target
        } elseif ($percentage >= 90 && $percentage <= 110) {
            return 'green'; // Target achieved
        } else {
            return 'blue'; // Above target
        }
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
