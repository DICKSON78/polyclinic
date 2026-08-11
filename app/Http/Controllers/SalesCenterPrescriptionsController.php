<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class SalesCenterPrescriptionsController extends Controller
{
    use ApiResponse;

    /**
     * Get clients with prescriptions but no purchases
     */
    public function index(Request $request)
    {
        try {
            $request->validate([
                'per_page' => 'sometimes|integer|min:0',
                'page' => 'sometimes|integer|min:1',
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d',
                'patient_name' => 'sometimes|string',
                'patient_number' => 'sometimes|string',
            ]);

            $user = $request->user();
            $per_page = $request->per_page ?? 25;

            // Handle clinic filtering
            if (!$user || $user->is_admin) {
                $clinic_id = $request->clinic_id;
            } else {
                $clinic_id = $user->clinic_id;
            }

            // Get consultations with outpatient prescriptions that haven't been dispensed
            // A prescription is considered "not dispensed" if:
            // 1. Consultation has an outpatient prescription item (non-Pharmacy, non-Procedure)
            // 2. Status is 'Consulted' (consultation completed)
            // 3. The patient has no PatientPaymentCacheItem with status 'Paid' or 'Served' for outpatient items

            $query = Consultation::query()
                ->with([
                    'payment_cache_item.payment_cache.check_in.patient',
                    'creator',
                ])
                ->where('status', 'Consulted')
                ->whereHas('payment_cache_item.consultation_type', function ($q) {
                    $q->whereNotIn('name', ['Pharmacy', 'Procedure']);
                })
                ->whereHas('payment_cache_item', function ($q) {
                    // Ensure payment_cache_item exists
                    $q->whereNotNull('id');
                });

            // Check if patient has any paid/served outpatient items
            // Exclude consultations where the patient already has paid/served outpatient items
            $query->whereRaw('NOT EXISTS (
                SELECT 1 
                FROM patient_payment_cache_items ppci
                INNER JOIN patient_payment_cache ppc ON ppci.payment_cache_id = ppc.id
                INNER JOIN patient_check_ins pci ON ppc.check_in_id = pci.id
                INNER JOIN consultation_types ct ON ppci.consultation_type_id = ct.id
                WHERE pci.patient_id = (
                    SELECT pci2.patient_id
                    FROM patient_payment_cache_items ppci2
                    INNER JOIN patient_payment_cache ppc2 ON ppci2.payment_cache_id = ppc2.id
                    INNER JOIN patient_check_ins pci2 ON ppc2.check_in_id = pci2.id
                    WHERE ppci2.id = consultations.payment_cache_item_id
                    LIMIT 1
                )
                AND ct.name NOT IN ("Pharmacy", "Procedure")
                AND ppci.status IN ("Paid", "Served")
            )');

            if ($clinic_id) {
                $query->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($userQuery) use ($clinic_id) {
                        $userQuery->where('clinic_id', $clinic_id);
                    });
                });
            }

            if ($request->start_date) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }

            if ($request->end_date) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }

            if ($request->patient_name) {
                $query->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($q) use ($request) {
                    $q->where('full_name', 'like', '%' . $request->patient_name . '%');
                });
            }

            if ($request->patient_number) {
                $query->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($q) use ($request) {
                    $q->where('id', $request->patient_number);
                });
            }

            $consultations = $query->orderBy('created_at', 'desc')
                ->paginate($per_page);

            // Transform the data for frontend
            $data = $consultations->getCollection()->map(function ($consultation) {
                try {
                    $patient = $consultation->payment_cache_item->payment_cache->check_in->patient ?? null;
                    $paymentCacheItem = $consultation->payment_cache_item ?? null;
                    $checkIn = $paymentCacheItem->payment_cache->check_in ?? null;

                    return [
                        'id' => $consultation->id,
                        'consultation_id' => $consultation->id,
                        'patient_id' => $patient->id ?? null,
                        'patient_name' => $patient->full_name ?? 'N/A',
                        'patient_number' => $patient->id ?? 'N/A',
                        'patient_phone' => $patient->phone ?? 'N/A',
                        'patient_email' => $patient->email ?? 'N/A',
                        'patient_gender' => $patient->gender ?? 'N/A',
                        'consultation_date' => $consultation->created_at ? Carbon::parse($consultation->created_at)->format('Y-m-d H:i:s') : null,
                        'consultation_date_formatted' => $consultation->created_at ? Carbon::parse($consultation->created_at)->format('M d, Y') : 'N/A',
                        'consulted_by' => $consultation->creator->full_name ?? 'N/A',
                        'days_since_prescription' => $consultation->created_at ? Carbon::parse($consultation->created_at)->diffInDays(Carbon::now()) : 0,
                        'require_glass' => $consultation->require_glass,
                        'remarks' => $consultation->remarks,
                    ];
                } catch (\Exception $e) {
                    \Log::error('Error mapping consultation data', [
                        'consultation_id' => $consultation->id,
                        'error' => $e->getMessage(),
                    ]);
                    return null;
                }
            })->filter(function ($item) {
                return $item !== null;
            });

            $consultations->setCollection($data);

            return $this->sendResponse($consultations, Response::HTTP_OK, 'Prescriptions without purchases retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('SalesCenterPrescriptionsController index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return $this->sendError(
                'An error occurred while fetching prescriptions. Please try again later.',
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get summary statistics
     */
    public function summary(Request $request)
    {
        $user = $request->user();

        // Handle clinic filtering
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        $query = Consultation::query()
            ->where('status', 'Consulted')
            ->whereHas('payment_cache_item.consultation_type', function ($q) {
                $q->whereNotIn('name', ['Pharmacy', 'Procedure']);
            })
            ->whereHas('payment_cache_item', function ($q) {
                // Ensure payment_cache_item exists
                $q->whereNotNull('id');
            })
            ->whereRaw('NOT EXISTS (
                SELECT 1 
                FROM patient_payment_cache_items ppci
                INNER JOIN patient_payment_cache ppc ON ppci.payment_cache_id = ppc.id
                INNER JOIN patient_check_ins pci ON ppc.check_in_id = pci.id
                INNER JOIN consultation_types ct ON ppci.consultation_type_id = ct.id
                WHERE pci.patient_id = (
                    SELECT pci2.patient_id
                    FROM patient_payment_cache_items ppci2
                    INNER JOIN patient_payment_cache ppc2 ON ppci2.payment_cache_id = ppc2.id
                    INNER JOIN patient_check_ins pci2 ON ppc2.check_in_id = pci2.id
                    WHERE ppci2.id = consultations.payment_cache_item_id
                    LIMIT 1
                )
                AND ct.name NOT IN ("Pharmacy", "Procedure")
                AND ppci.status IN ("Paid", "Served")
            )')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($userQuery) use ($clinic_id) {
                        $userQuery->where('clinic_id', $clinic_id);
                    });
                });
            });

        $total = $query->count();

        // Group by days since prescription
        $by_days = [
            'today' => (clone $query)->whereDate('created_at', Carbon::today())->count(),
            'last_7_days' => (clone $query)->whereDate('created_at', '>=', Carbon::now()->subDays(7))->count(),
            'last_30_days' => (clone $query)->whereDate('created_at', '>=', Carbon::now()->subDays(30))->count(),
            'over_30_days' => (clone $query)->whereDate('created_at', '<', Carbon::now()->subDays(30))->count(),
        ];

        return $this->sendResponse([
            'total' => $total,
            'by_days' => $by_days,
        ], Response::HTTP_OK, 'Summary retrieved successfully.');
    }
}

