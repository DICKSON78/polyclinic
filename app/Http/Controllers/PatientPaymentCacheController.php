<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientPaymentCache;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientPaymentCacheController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $request->validate([
                'per_page' => 'sometimes|integer|min:0',
                'page' => 'sometimes|integer|min:1',
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d',
                'consultation_status' => 'sometimes|string'
            ]);

            $user = $request->user();
            if (!$user) {
                return $this->sendError('Unauthenticated', Response::HTTP_UNAUTHORIZED);
            }
            $per_page = $request->per_page ?? 25;
            $clinic_id = $request->clinic_id;
            $patient_name = $request->patient_name;
            $patient_id = $request->patient_id;
            $patient_gender = $request->patient_gender;
            $patient_phone = $request->patient_phone;
            $item_status = $request->item_status;
            $item_payment_mode_id = $request->item_payment_mode_id;
            $item_payment_type = $request->item_payment_type;
            $item_consultation_type = $request->item_consultation_type;
            $is_stock_item = $request->is_stock_item;
            $item_consultant_id = $request->item_consultant_id;
            $start_date = $request->start_date;
            $end_date = $request->end_date;
            $consultation_status = $request->consultation_status;

            $data = PatientPaymentCache::with(['check_in.patient', 'check_in.payment_mode', 'creator', 'consultation', 'items.consultation_type', 'items.item', 'items.payment_mode']);

            // Normalize date range: if only start_date provided, default end_date to today
            if ($start_date && !$end_date) {
                $end_date = Carbon::now()->format('Y-m-d');
            }
            // If end_date before start_date, swap to avoid empty/invalid ranges
            if ($start_date && $end_date && $end_date < $start_date) {
                [$start_date, $end_date] = [$end_date, $start_date];
            }

            if ($user->is_admin) {
                $data->with(['creator.clinic']);

                if ($clinic_id) {
                    $data->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                }
            } else {
                if ($user->clinic_id) {
                    $data->whereHas('creator', function ($query) use ($user) {
                        $query->where('clinic_id', $user->clinic_id);
                    });
                } else {
                    // If user has no clinic_id, return empty result
                    $data->whereRaw('1 = 0');
                }
            }

            if ($patient_name) {
                $data->whereHas('check_in', function ($query) use ($patient_name) {
                    $query->whereHas('patient', function ($subQuery) use ($patient_name) {
                        $subQuery->fullName('%' . $patient_name . '%');
                    });
                });
            }

            if ($patient_id) {
                $data->whereHas('check_in', function ($query) use ($patient_id) {
                    $query->where('patient_id', $patient_id);
                });
            }

            if ($patient_gender) {
                $data->whereHas('check_in', function ($query) use ($patient_gender) {
                    $query->whereHas('patient', function ($subQuery) use ($patient_gender) {
                        $subQuery->where('gender', $patient_gender);
                    });
                });
            }

            if ($patient_phone) {
                $data->whereHas('check_in', function ($query) use ($patient_phone) {
                    $query->whereHas('patient', function ($subQuery) use ($patient_phone) {
                        $subQuery->where('phone', 'like', '%' . $patient_phone . '%');
                    });
                });
            }

            // Regular filtering logic - ensure we only get payment caches that have at least one item matching ALL criteria
            $data->whereHas('items', function ($query) use ($item_status, $item_consultation_type, $is_stock_item, $item_consultant_id, $item_payment_mode_id, $item_payment_type) {
                // Status filter
                if ($item_status) {
                    $statuses = explode(',', $item_status);
                    if (count($statuses) > 1) {
                        $query->whereIn('status', $statuses);
                    } else {
                        $query->where('status', $statuses[0]);
                    }
                }
                
                // Consultation type filter
                if ($item_consultation_type) {
                    if ($item_consultation_type === 'Outpatient') {
                        // Outpatient dispensing covers all item types except Pharmacy and Procedure
                        $query->whereHas('consultation_type', function ($query2) {
                            $query2->whereNotIn('name', ['Pharmacy', 'Procedure']);
                        });
                    } else {
                        $query->whereHas('consultation_type', function ($query2) use ($item_consultation_type) {
                            $query2->where('name', $item_consultation_type);
                        });
                    }
                }
                
                // Stock item filter
                if ($is_stock_item) {
                    $query->whereHas('item', function ($query2) use ($is_stock_item) {
                        $query2->where('is_stock_item', $is_stock_item);
                    });
                }
                
                // Consultant filter
                if ($item_consultant_id) {
                    $query->where('consultant_id', $item_consultant_id);
                }
                
                // Payment mode filter
                if ($item_payment_mode_id) {
                    $query->where('payment_mode_id', $item_payment_mode_id);
                }
                
                // Transaction type filter - this is critical for cash patients
                if ($item_payment_type) {
                    $query->whereHas('payment_mode', function ($query2) use ($item_payment_type) {
                        $query2->whereRaw('LOWER(payment_type) = ?', [strtolower($item_payment_type)]);
                    });
                }
            });

            // Filter by consultation status if provided
            if ($consultation_status) {
                $data->whereHas('consultation', function ($query) use ($consultation_status) {
                    $query->where('status', $consultation_status);
                });
            }

            // Apply date filtering
            if ($start_date) {
                $data->whereDate('created_at', '>=', $start_date);
            }
            if ($end_date) {
                $data->whereDate('created_at', '<=', $end_date);
            }

            $data->orderBy('created_at', 'desc');
            
            // Debug: Log the SQL query for debugging
            \Log::info('PatientPaymentCacheController SQL query', [
                'sql' => $data->toSql(),
                'bindings' => $data->getBindings(),
                'item_status' => $item_status,
                'item_payment_type' => $item_payment_type,
                'start_date' => $start_date,
                'end_date' => $end_date,
                'item_consultation_type' => $item_consultation_type,
                'clinic_id' => $user->is_admin ? $clinic_id : $user->clinic_id,
                'user_id' => $user->id,
                'user_is_admin' => $user->is_admin,
            ]);
            
            // Debug: Check if there are any payment cache records at all
            $totalPaymentCaches = PatientPaymentCache::when($user->is_admin && $clinic_id, function ($q) use ($clinic_id) {
                $q->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }, function ($q) use ($user) {
                if ($user->clinic_id) {
                    $q->whereHas('creator', function ($query) use ($user) {
                        $query->where('clinic_id', $user->clinic_id);
                    });
                }
            })->count();
            
            // Debug: Check if there are any items with pending cash status
            $totalPendingCashItems = \App\Models\PatientPaymentCacheItem::whereHas('payment_mode', function ($q) {
                $q->whereRaw('LOWER(payment_type) = ?', ['cash']);
            })->where('status', 'Pending')->count();
            
            \Log::info('PatientPaymentCacheController debug counts', [
                'total_payment_caches' => $totalPaymentCaches,
                'total_pending_cash_items' => $totalPendingCashItems,
            ]);
            
            $result = $data->paginate($per_page);
            
            \Log::info('PatientPaymentCacheController result', [
                'total' => $result->total(),
                'per_page' => $result->perPage(),
                'current_page' => $result->currentPage(),
            ]);
            
            return $this->sendResponse($result, Response::HTTP_OK, 'Success.');
        } catch (\Exception $e) {
            \Log::error('Error in PatientPaymentCacheController::index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->sendError('Error fetching payment cache data', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PatientPaymentCache::with([
            'check_in.patient',
            'creator',
            'consultation',
            'consultation.creator',
            'items' => function ($q) {
                $q->with(['item', 'payment_mode', 'consultation_type']);
            },
        ])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'check_in_id' => 'sometimes|exists:patient_check_ins,id',
            'consultation_id' => 'sometimes|exists:consultations,id',
        ]);

        $data = PatientPaymentCache::with(['check_in.patient', 'creator', 'consultation', 'items' => function ($q) {
            $q->with(['item', 'payment_mode', 'consultation_type']);
        }])->findOrFail($id);

        $data->update($request->only('check_in_id', 'consultation_id'));

        return $this->sendResponse($data, Response::HTTP_OK, 'Updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $data = PatientPaymentCache::with('items')->findOrFail($id);

        $paidOrServed = $data->items()->whereIn('status', ['Paid', 'Served', 'Billed'])->count();
        if ($paidOrServed > 0) {
            return $this->sendError('Cannot delete a patient payment cache that contains paid, billed or served items.', Response::HTTP_CONFLICT);
        }

        // Remove linked items before deleting the cache to avoid orphaned records
        $data->items()->delete();
        $data->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Deleted successfully.');
    }
}
