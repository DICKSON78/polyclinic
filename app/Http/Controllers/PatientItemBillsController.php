<?php

namespace App\Http\Controllers;

use App\Events\NotificationUpdate;
use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\PatientItemBill;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientItemBillsController extends Controller
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
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $status = $request->status;
        $id = $request->id;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $with_items = $request->with_items;
        $start_date = $request->start_date;
        $end_date = $request->end_date;

        $data = PatientItemBill::with(['first_item.payment_cache.consultation', 'creator'])->whereHas('first_item');

        if ($user->is_admin) {
            $data->with(['creator.clinic']);

            if ($clinic_id) {
                $data->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
        } else {
            $data->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
        }

        if ($status) {
            $data->where('status', $status);
        }

        if ($id) {
            $data->where('id', $id);
        }

        if ($patient_name) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->whereHas('items.payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_gender) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($with_items == 'Yes') {
            $data->with(['items' => function ($query) {
                $query->with(['item.unit_of_measure', 'payment_mode', 'creator']);
            }]);
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        // Default to today if no date range is specified (Requests filtering to daily)
        if (!$start_date && !$end_date) {
            $data->whereDate('created_at', Carbon::today());
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
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
        $data = PatientItemBill::with(['creator', 'clearer', 'first_item.payment_cache.consultation'])->findOrFail($id);
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
        $data = PatientItemBill::findOrFail($id);
        $data->update($request->only('discount'));
        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    public function clear(Request $request, $id)
    {
        $data = PatientItemBill::findOrFail($id);
        $clearedBy = $request->user()->id;
        $data->update([
            'status' => 'Cleared',
            'cleared_at' => Carbon::now(),
            'cleared_by' => $clearedBy,
        ]);

        // Determine next department based on patient's treatment needs when bill is cleared
        if ($data->first_item) {
            $patient = $data->first_item->payment_cache->check_in->patient;
            $waitingTime = $patient->current_waiting_time;
            if ($waitingTime) {
                $this->determineNextDepartment($waitingTime, $data->first_item->payment_cache, $clearedBy);
            }
        }

        // Trigger notification refresh for real-time updates (especially for spectacle patients)
        try {
            event(new \App\Events\NotificationUpdate());
            \Log::info('Bill cleared - notification refresh triggered', [
                'bill_id' => $data->id
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to trigger notification refresh after bill cleared', [
                'error' => $e->getMessage()
            ]);
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Cleared successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    /**
     * Determine the next department for a patient based on their treatment needs
     * 
     * @param \App\Models\PatientWaitingTime $waitingTime
     * @param \App\Models\PatientPaymentCache $paymentCache
     * @param int|null $clearedBy User ID who cleared the bill (cashier)
     */
    private function determineNextDepartment($waitingTime, $paymentCache, $clearedBy = null)
    {
        
        // Check if patient has a consultation record
        // Load consultation with its payment_cache_item and consultation_type relationships
        $consultation = $paymentCache->consultation;
        if ($consultation) {
            $consultation->load(['payment_cache_item.consultation_type']);
        }
        
        // Also check if patient has outpatient items (non-Pharmacy, non-Procedure) that require dispensing
        $hasOutpatientItems = $paymentCache->items()
            ->whereHas('consultation_type', function($query) {
                $query->whereNotIn('name', ['Pharmacy', 'Procedure']);
            })
            ->count() > 0;
        
        // Priority 1: If patient has outpatient items, send to dispensing (workshop) FIRST
        if ($hasOutpatientItems) {
            // Patient has outpatient items, send to dispensing department
            $waitingTime->sendToDispensing();
            
            // Trigger notification refresh for dispensing/workshop
            try {
                event(new \App\Events\NotificationUpdate());
                \Log::info('Notification refresh triggered after sending patient to dispensing', [
                    'patient_id' => $waitingTime->patient_id,
                    'patient_name' => $waitingTime->patient->full_name ?? 'Unknown',
                    'department' => 'dispensing'
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to trigger notification after sending to dispensing', [
                    'patient_id' => $waitingTime->patient_id,
                    'error' => $e->getMessage()
                ]);
            }
            
            // Check if existing consultation's payment_cache_item is an outpatient item
            $consultationHasOutpatientItem = false;
            if ($consultation && $consultation->payment_cache_item) {
                $consultationHasOutpatientItem = $consultation->payment_cache_item->consultation_type 
                    && !in_array($consultation->payment_cache_item->consultation_type->name, ['Pharmacy', 'Procedure']);
            }
            
            // If consultation exists and its payment_cache_item is an outpatient item, update it
            if ($consultation && $consultationHasOutpatientItem) {
                $updateData = [
                    'patient_direction' => 'Sent to Dispensing', // Mark as sent from cashier
                ];
                
                // Set sent_to_optician_at if not already set
                if (!$consultation->sent_to_optician_at) {
                    $updateData['sent_to_optician_at'] = now();
                }
                
                // Set sent_to_optician_by to the cashier who cleared the bill
                if ($clearedBy) {
                    $updateData['sent_to_optician_by'] = $clearedBy;
                } elseif (!$consultation->sent_to_optician_by) {
                    // Fallback to consultation creator if no cleared_by available
                    $updateData['sent_to_optician_by'] = $consultation->creator_id ?? null;
                }
                
                $consultation->update($updateData);
            } elseif ($hasOutpatientItems) {
                // If consultation doesn't exist OR exists but from non-outpatient item, create/update from outpatient item
                // Find the first outpatient item to create or update consultation
                $outpatientItem = $paymentCache->items()
                    ->whereHas('consultation_type', function($query) {
                        $query->whereNotIn('name', ['Pharmacy', 'Procedure']);
                    })
                    ->first();
                
                if ($outpatientItem) {
                    if ($consultation) {
                        // Update existing consultation to use outpatient item
                        $consultation->update([
                            'payment_cache_item_id' => $outpatientItem->id,
                            'patient_direction' => 'Sent to Dispensing',
                            'sent_to_optician_at' => now(),
                            'sent_to_optician_by' => $clearedBy ?? $consultation->creator_id ?? null,
                        ]);
                    } else {
                        // Create new consultation from outpatient item
                        $consultation = Consultation::create([
                            'payment_cache_item_id' => $outpatientItem->id,
                            'patient_direction' => 'Sent to Dispensing', // Mark as sent from cashier
                            'created_by' => $outpatientItem->creator_id ?? 1, // Default to system user if no creator
                            'sent_to_optician_at' => now(),
                            'sent_to_optician_by' => $clearedBy ?? $outpatientItem->creator_id ?? 1,
                        ]);
                        
                        $paymentCache->consultation_id = $consultation->id;
                        $paymentCache->save();
                    }
                }
            }
            
            \Log::info('Patient moved to dispensing after bill cleared (outpatient items)', [
                'patient_id' => $waitingTime->patient_id,
                'patient_name' => $waitingTime->patient->full_name ?? 'Unknown',
                'has_outpatient_items' => $hasOutpatientItems,
                'cleared_by' => $clearedBy
            ]);
            return;
        }
        
        // Priority 2: Check for pending pharmacy items that need dispensing
        $pendingPharmacyItems = $paymentCache->items()
            ->where('status', '!=', 'Served')
            ->whereHas('consultation_type', function($query) {
                $query->where('name', 'Pharmacy');
            })
            ->count();
        
        if ($pendingPharmacyItems > 0) {
            // Patient has items that need dispensing (pharmacy items)
            $waitingTime->sendToDispensing();
            
            // Trigger notification refresh for dispensing/workshop
            try {
                event(new \App\Events\NotificationUpdate());
                \Log::info('Notification refresh triggered after sending patient to dispensing', [
                    'patient_id' => $waitingTime->patient_id,
                    'patient_name' => $waitingTime->patient->full_name ?? 'Unknown',
                    'department' => 'dispensing'
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to trigger notification after sending to dispensing', [
                    'patient_id' => $waitingTime->patient_id,
                    'error' => $e->getMessage()
                ]);
            }
            
            \Log::info('Patient moved to dispensing after bill cleared (pharmacy items)', [
                'patient_id' => $waitingTime->patient_id,
                'patient_name' => $waitingTime->patient->full_name ?? 'Unknown',
                'pending_items' => $pendingPharmacyItems
            ]);
            return;
        }

        // Priority 3: Check if patient has any procedures scheduled
        $hasProcedures = $paymentCache->items()
            ->whereHas('item.consultation_type', function($query) {
                $query->where('name', 'like', '%Surgery%')
                      ->orWhere('name', 'like', '%Procedure%');
            })
            ->count() > 0;
        
        if ($hasProcedures) {
            // Patient has procedures, send to procedure room
            $waitingTime->sendToProcedureRoom();
            \Log::info('Patient moved to procedure room after bill cleared', [
                'patient_id' => $waitingTime->patient_id,
                'patient_name' => $waitingTime->patient->full_name ?? 'Unknown'
            ]);
            return;
        }

        // Priority 4: If no specific treatment needs, return to reception
        $waitingTime->returnToReception('Bill cleared - treatment complete');
        \Log::info('Patient returned to reception after bill cleared - no further treatment needed', [
            'patient_id' => $waitingTime->patient_id,
            'patient_name' => $waitingTime->patient->full_name ?? 'Unknown'
        ]);
    }
}
