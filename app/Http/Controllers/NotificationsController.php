<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use App\Models\PatientWaitingTime;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NotificationsController extends Controller
{
    use ApiResponse;

    /**
     * Clear notification cache for a specific user
     */
    private function clearNotificationCache($userId = null, $clinicId = null)
    {
        if ($userId) {
            // Clear cache for specific user
            $cacheKey = "notifications_user_{$userId}_clinic_" . ($clinicId ?? 'null');
            cache()->forget($cacheKey);
        } else {
            // Clear all notification caches (fallback, but expensive)
            // This would only be used in rare cases
            cache()->flush();
        }
    }

    public function __invoke(Request $request)
    {
        $user = $request->user();
        
        // Simplified authentication check
        if (!$user) {
            Log::info('NotificationsController: No authenticated user, returning defaults');
            return $this->sendResponse($this->getDefaultData(), Response::HTTP_OK, 'Success.');
        }

        Log::info('NotificationsController: User authenticated', ['user_id' => $user->id, 'role' => $user->role]);

        $clinic_id = $user->is_admin ? ($request->clinic_id ?? null) : ($user->clinic_id ?? null);

        // Simple cache check
        $cacheKey = "notifications_user_{$user->id}_clinic_" . ($clinic_id ?? 'null');
        $cachedData = cache()->get($cacheKey);

        if ($cachedData && !app()->environment('local')) {
            return $this->sendResponse($cachedData, Response::HTTP_OK, 'Success (cached).');
        }

        try {
            Log::info('NotificationsController: Calculating notifications', ['clinic_id' => $clinic_id]);
            
            $data = [
                'patients_sent_to_cashier' => $this->getPatientsSentToCashierCount($clinic_id),
                'credit_patients_approval' => $this->getCreditPatientsApprovalCount($clinic_id),
                'patients_sent_to_doctor' => $this->getPatientsSentToDoctorCount($clinic_id),
                'patients_sent_to_optician' => $this->getPatientsSentToOpticianCount($clinic_id),
                'glass_patients' => $this->getGlassPatientsCount($clinic_id),
                'dispensing_requests' => $this->getDispensingRequestsCount($clinic_id),
                'procedure_requests' => $this->getProcedureRequestsCount($clinic_id),
                'other_dispensing_requests' => $this->getOtherDispensingRequestsCount($clinic_id),
                'patients_to_return' => $this->getPatientsToReturnCount($clinic_id),
                'glass_dispensing_requests' => $this->getGlassDispensingRequestsCount($clinic_id),
                'vip_patients' => $this->getVipPatientsCount($clinic_id),
                'spectacle_patients' => $this->getSpectaclePatientsCount($clinic_id),
                'waiting_patients' => $this->getWaitingPatientsCount($clinic_id),
                'patients_sent_to_sales' => $this->getPatientsSentToSalesCount($clinic_id),
                'website_appointments' => $this->getWebsiteAppointmentsCount(),
            ];

            Log::info('NotificationsController: Data calculated', $data);

            // Cache for 5 seconds
            cache()->put($cacheKey, $data, 5);

            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Throwable $e) {
            Log::error('NotificationsController: Failed to calculate notifications: ' . $e->getMessage());
            Log::error('NotificationsController: Stack trace: ' . $e->getTraceAsString());

            return $this->sendResponse($this->getDefaultData(), Response::HTTP_OK, 'Success.');
        }
    }

    private function getDefaultData()
    {
        return [
            'patients_sent_to_cashier' => 0,
            'credit_patients_approval' => 0,
            'patients_sent_to_doctor' => 0,
            'patients_sent_to_optician' => 0,
            'glass_patients' => 0,
            'dispensing_requests' => 0,
            'procedure_requests' => 0,
            'other_dispensing_requests' => 0,
            'patients_to_return' => 0,
            'glass_dispensing_requests' => 0,
            'vip_patients' => 0,
            'spectacle_patients' => 0,
            'waiting_patients' => 0,
            'patients_sent_to_sales' => 0,
            'website_appointments' => 0,
        ];
    }

    private function getWebsiteAppointmentsCount()
    {
        try {
            return Appointment::query()
                ->where('status', 'Pending')
                ->whereNotNull('created_at')
                ->where('created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59')
                ->count();
        } catch (\Exception $e) {
            Log::error('Error counting website_appointments: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Count payment caches that are "sent to sales" (consulted, with Pending/Billed items) - matches Patients Sent to Sales list.
     * Only counts today's patients.
     */
    private function getPatientsSentToSalesCount($clinic_id)
    {
        try {
            $query = PatientPaymentCache::query()
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($creatorQuery) use ($clinic_id) {
                        $creatorQuery->where('clinic_id', $clinic_id);
                    });
                })
                ->where(function ($cacheQuery) {
                    $cacheQuery->whereHas('consultation', function ($consultationQuery) {
                        $consultationQuery->where('status', 'Consulted');
                    })
                    ->orWhereHas('items.consultation', function ($consultationQuery) {
                        $consultationQuery->where('status', 'Consulted');
                    });
                })
                ->whereHas('items', function ($itemQuery) {
                    $itemQuery->whereIn('status', ['Pending', 'Billed'])
                              ->whereNull('item_payment_id');
                })
                ->whereNotNull('created_at')
                ->where('created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');

            return $query->distinct('patient_payment_cache.id')->count('patient_payment_cache.id');
        } catch (\Exception $e) {
            Log::error('Error counting patients_sent_to_sales: ' . $e->getMessage());
            return 0;
        }
    }

    private function getPatientsSentToCashierCount($clinic_id)
    {
        try {
            // Count patients routed to cashier with cash-type items (match cashier queue rules)
            $query = PatientPaymentCache::query()
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->whereHas('items', function ($query) {
                    $query->whereIn('status', ['Pending', 'Billed', 'Served'])
                        // Don't exclude items that are already invoiced - allow all routed patients
                        // ->whereNull('item_payment_id') // Removed to match frontend behavior
                        ->whereHas('payment_mode', function ($q) {
                            $q->whereRaw('LOWER(payment_type) = ?', ['cash']);
                        });
                })
                ->where('created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');

            return $query->distinct('patient_payment_cache.id')->count();
        } catch (\Exception $e) {
            Log::error('Error counting patients_sent_to_cashier: ' . $e->getMessage());
            return 0;
        }
    }

    private function getCreditPatientsApprovalCount($clinic_id)
    {
        try {
            // Count patients with pending credit items
            $query = PatientPaymentCache::query()
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->whereHas('items', function ($query) {
                    $query->where('status', 'Pending')
                        ->whereHas('payment_mode', function ($q) {
                            $q->where('payment_type', 'Credit');
                        });
                })
                ->whereNotNull('created_at')
                ->where('created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');

            return $query->distinct()->count();
        } catch (\Exception $e) {
            Log::error('Error counting credit_patients_approval: ' . $e->getMessage());
            return 0;
        }
    }

    private function getPatientsSentToDoctorCount($clinic_id)
    {
        try {
            // Match Pending list in Consultation Room: only paid consultation items that require consultation
            $query = Consultation::query()
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Pending')
                ->whereHas('payment_cache_item', function ($q) {
                    $q->whereHas('item', function ($itemQuery) {
                        $itemQuery->where('is_consultation_item', 'Yes');
                    });
                    $q->where('status', 'Paid');
                })
                ->whereNotNull('created_at')
                ->where('created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');

            return $query->count();
        } catch (\Exception $e) {
            Log::error('Error counting patients_sent_to_doctor: ' . $e->getMessage());
            return 0;
        }
    }

    private function getPatientsSentToOpticianCount($clinic_id)
    {
        try {
            // Count consultations awaiting outpatient dispensing (any item type except Pharmacy/Procedure that isn't served)
            $query = Consultation::query()
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->whereHas('payment_cache', function ($query) {
                    $query->whereHas('items', function ($itemsQuery) {
                        $itemsQuery->whereHas('item.consultation_type', function ($typeQuery) {
                            $typeQuery->whereNotIn('name', ['Pharmacy', 'Procedure']);
                        })
                        ->where('status', '!=', 'Served');
                    });
                })
                ->whereNotNull('created_at')
                ->where('created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');

            return $query->count();
        } catch (\Exception $e) {
            Log::error('Error counting patients_sent_to_optician: ' . $e->getMessage());
            return 0;
        }
    }

    private function getGlassPatientsCount($clinic_id)
    {
        try {
            // Count patients with items awaiting outpatient dispensing (non-Pharmacy/Procedure)
            $query = PatientPaymentCache::query()
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->whereHas('items', function ($query) {
                    $query->whereHas('consultation_type', function ($q) {
                        $q->whereNotIn('name', ['Pharmacy', 'Procedure']);
                    })
                    ->where('status', '!=', 'Served');
                })
                ->whereNotNull('created_at')
                ->where('created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');

            return $query->distinct('patient_payment_cache.id')->count();
        } catch (\Exception $e) {
            Log::error('Error counting glass_patients: ' . $e->getMessage());
            return 0;
        }
    }

    private function getDispensingRequestsCount($clinic_id)
    {
        try {
            // Count pharmacy items with status Paid/Billed (pending dispensing).
            // status='Paid' means paid at payment center, awaiting dispensing.
            // status='Served' means already dispensed (excluded by the status filter).
            $query = PatientPaymentCacheItem::query()
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->where('users.clinic_id', $clinic_id);
                })
                ->where('consultation_types.name', 'Pharmacy')
                ->whereIn('patient_payment_cache_items.status', ['Paid', 'Billed'])
                ->whereNotNull('patient_payment_cache.created_at')
                ->where('patient_payment_cache.created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('patient_payment_cache.created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');

            return $query->distinct('patient_payment_cache.id')->count('patient_payment_cache.id');
        } catch (\Exception $e) {
            Log::error('Error counting dispensing_requests: ' . $e->getMessage());
            return 0;
        }
    }

    private function getProcedureRequestsCount($clinic_id)
    {
        try {
            // Count procedure items with pending status
            $query = PatientPaymentCacheItem::query()
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->where('users.clinic_id', $clinic_id);
                })
                ->where('consultation_types.name', 'Procedure')
                ->whereIn('patient_payment_cache_items.status', ['Pending', 'Paid', 'Billed'])
                ->whereNotNull('patient_payment_cache.created_at')
                ->where('patient_payment_cache.created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('patient_payment_cache.created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');

            return $query->distinct('patient_payment_cache.id')->count('patient_payment_cache.id');
        } catch (\Exception $e) {
            Log::error('Error counting procedure_requests: ' . $e->getMessage());
            return 0;
        }
    }

    private function getOtherDispensingRequestsCount($clinic_id)
    {
        try {
            // Count outpatient dispensing requests (non-pharmacy, non-procedure items)
            // Exclude items that have already been dispensed (have item_payment_id)
            $query = PatientPaymentCacheItem::query()
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->where('users.clinic_id', $clinic_id);
                })
                ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                ->whereIn('patient_payment_cache_items.status', ['Paid', 'Billed'])
                ->whereNotNull('patient_payment_cache.created_at')
                ->where('patient_payment_cache.created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('patient_payment_cache.created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');

            return $query->distinct('patient_payment_cache.id')->count('patient_payment_cache.id');
        } catch (\Exception $e) {
            Log::error('Error counting other_dispensing_requests: ' . $e->getMessage());
            return 0;
        }
    }

    private function getPatientsToReturnCount($clinic_id)
    {
        try {
            // Count consultations with patient_to_return = 'Yes'
            $query = Consultation::query()
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Consulted')
                ->where('patient_to_return', 'Yes')
                ->whereNotNull('to_return_date')
                ->whereBetween('to_return_date', [Carbon::today()->format('Y-m-d'), Carbon::today()->format('Y-m-d')]);

            return $query->count();
        } catch (\Exception $e) {
            Log::error('Error counting patients_to_return: ' . $e->getMessage());
            return 0;
        }
    }

    private function getGlassDispensingRequestsCount($clinic_id)
    {
        try {
            // Count items ready for outpatient dispensing (non-pharmacy, non-procedure)
            // Exclude items that have already been dispensed (have item_payment_id)
            $query = PatientPaymentCacheItem::query()
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
                ->join('users', 'patient_payment_cache.created_by', '=', 'users.id')
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->where('users.clinic_id', $clinic_id);
                })
                ->whereNotIn('consultation_types.name', ['Pharmacy', 'Procedure'])
                ->whereIn('patient_payment_cache_items.status', ['Paid', 'Billed'])
                ->whereNotNull('patient_payment_cache.created_at')
                ->where('patient_payment_cache.created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('patient_payment_cache.created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');

            return $query->distinct('patient_payment_cache.id')->count('patient_payment_cache.id');
        } catch (\Exception $e) {
            Log::error('Error counting glass_dispensing_requests: ' . $e->getMessage());
            return 0;
        }
    }

    private function getVipPatientsCount($clinic_id)
    {
        try {
            // Count VIP patients registered today who haven't checked in
            $query = Patient::query()
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->where(function ($q) {
                    $q->where('is_vip', 'Yes')
                      ->orWhere('is_vip', true)
                      ->orWhere('is_vip', 1);
                })
                ->whereDoesntHave('check_ins', function ($query) {
                    $query->where('created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                          ->where('created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');
                })
                ->whereNotNull('created_at')
                ->where('created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');

            return $query->count();
        } catch (\Exception $e) {
            Log::error('Error counting vip_patients: ' . $e->getMessage());
            return 0;
        }
    }

    private function getSpectaclePatientsCount($clinic_id)
    {
        try {
            // Count patients with items awaiting outpatient dispensing today
            $query = PatientPaymentCache::query()
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->whereHas('items', function ($query) {
                    $query->whereHas('consultation_type', function ($q) {
                        $q->whereNotIn('name', ['Pharmacy', 'Procedure']);
                    })
                    ->where('status', '!=', 'Served');
                })
                ->whereNotNull('created_at')
                ->where('created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59');

            return $query->distinct('patient_payment_cache.id')->count();
        } catch (\Exception $e) {
            Log::error('Error counting spectacle_patients: ' . $e->getMessage());
            return 0;
        }
    }

    private function getWaitingPatientsCount($clinic_id)
    {
        try {
            // Count patients waiting in consultation room today
            $query = PatientWaitingTime::query()
                ->whereIn('status', ['waiting', 'in_treatment'])
                ->where('current_department', 'consultation')
                ->whereNotNull('created_at')
                ->where('created_at', '>=', Carbon::today()->format('Y-m-d') . ' 00:00:00')
                ->where('created_at', '<=', Carbon::today()->format('Y-m-d') . ' 23:59:59')
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('patient.check_ins', function ($subQuery) use ($clinic_id) {
                        $subQuery->whereHas('payment_cache', function ($pcQuery) use ($clinic_id) {
                            $pcQuery->whereHas('items', function ($itemQuery) use ($clinic_id) {
                                $itemQuery->whereHas('creator', function ($userQuery) use ($clinic_id) {
                                    $userQuery->where('clinic_id', $clinic_id);
                                });
                            });
                        });
                    });
                });

            return $query->count();
        } catch (\Exception $e) {
            Log::error('Error counting waiting_patients: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get dynamic notifications based on view period
     */
    public function getDynamicNotifications(Request $request)
    {
        $request->validate([
            'view_period' => 'required|in:daily,weekly,monthly',
            'date' => 'nullable|date_format:Y-m-d'
        ]);

        $user = $request->user();
        
        // Return empty data if user is not authenticated
        if (!$user) {
            return $this->sendResponse([
                'waiting_patients' => 0,
                'vip_patients' => 0,
                'patients_to_return' => 0,
                'spectacle_patients' => 0,
                'completed_patients' => 0,
                'procedure_requests' => 0,
                'other_dispensing_requests' => 0,
            ], Response::HTTP_OK, 'Dynamic notifications retrieved successfully.');
        }
        
        $view_period = $request->view_period;
        $selected_date = $request->date ? Carbon::parse($request->date) : Carbon::today();

        $data = [
            'waiting_patients' => 0,
            'vip_patients' => 0,
            'patients_to_return' => 0,
            'spectacle_patients' => 0,
            'completed_patients' => 0,
            'procedure_requests' => 0,
            'other_dispensing_requests' => 0,
        ];

        // Calculate date range based on view period - use same logic as ConsultationsController
        $now = Carbon::now()->format('Y-m-d');
        
        if ($request->date) {
            // When specific date is selected, use that date regardless of view_period
            $start_date = $selected_date->copy();
            $end_date = $selected_date->copy();
        } else {
            // Apply view period filtering only when no specific date is selected
            switch ($view_period) {
                case 'daily':
                    $start_date = Carbon::now();
                    $end_date = Carbon::now();
                    break;
                case 'weekly':
                    $start_date = Carbon::now()->startOfWeek();
                    $end_date = Carbon::now()->endOfWeek();
                    break;
                case 'monthly':
                    $start_date = Carbon::now()->startOfMonth();
                    $end_date = Carbon::now()->endOfMonth();
                    break;
                default:
                    $start_date = Carbon::now();
                    $end_date = Carbon::now();
            }
        }

        // Patients to return based on view period
        try {
            $data['patients_to_return'] = Consultation::whereHas('creator', function ($query) use ($user) {
                if (!$user->is_admin && $user->clinic_id) {
                    $query->where('clinic_id', $user->clinic_id);
                }
            })
                ->where('status', 'Consulted')
                ->where('patient_to_return', 'Yes')
                ->whereNotNull('to_return_date')
                ->whereBetween('to_return_date', [$start_date->format('Y-m-d'), $end_date->format('Y-m-d')])
                ->count();
        } catch (\Exception $e) {
            Log::error('Error in getDynamicNotifications: ' . $e->getMessage());
            $data['patients_to_return'] = 0;
        }

        // Debug logging
        Log::info('Dynamic Notifications Debug', [
            'view_period' => $view_period,
            'selected_date' => $selected_date->format('Y-m-d'),
            'start_date' => $start_date->format('Y-m-d'),
            'end_date' => $end_date->format('Y-m-d'),
            'patients_to_return' => $data['patients_to_return'],
            'has_specific_date' => $request->has('date'),
            'current_week_start' => Carbon::now()->startOfWeek()->format('Y-m-d'),
            'current_week_end' => Carbon::now()->endOfWeek()->format('Y-m-d')
        ]);

        return $this->sendResponse($data, Response::HTTP_OK, 'Dynamic notifications retrieved successfully.');
    }
}
