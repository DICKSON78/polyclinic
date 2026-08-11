<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Jobs\SendConsultationMessageJob;
use App\Models\CataractSurgeryRecord;
use App\Models\Consultation;
use App\Models\ConsultationExternalExamination;
use App\Models\ConsultationFunctionalTest;
use App\Models\ConsultationFundoscopy;
use App\Models\ConsultationRefraction;
use App\Models\ConsultationVisualAcuity;
use App\Models\Item;
use App\Models\LabRequest;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use App\Models\RadiologyRequest;
use App\Models\SurgeryRecordReport;
use App\Models\VitalSign;
use App\Models\DoctorTask;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use stdClass;

class ConsultationsController extends Controller
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
            'end_date' => 'sometimes|date_format:Y-m-d',
            'to_return_date' => 'sometimes|date_format:Y-m-d',
            'view_period' => 'sometimes|in:daily,weekly,monthly'
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $with_diagnoses = $request->with_diagnoses;
        $status = $request->status;
        $require_glass = $request->require_glass;
        $payment_cache_item_id = $request->payment_cache_item_id;
        $item_id = $request->item_id;
        $patient_direction = $request->patient_direction;
        $consultant_id = $request->consultant_id;
        $patient_id = $request->patient_id;
        $patient_name = $request->patient_name;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $patient_to_return = $request->patient_to_return;
        $to_return_date = $request->to_return_date;
        $view_period = $request->view_period ?? 'daily';
        $item_payment_mode_id = $request->item_payment_mode_id;

        // Debug logging
        \Log::info('ConsultationsController Debug', [
            'patient_to_return' => $patient_to_return,
            'to_return_date' => $to_return_date,
            'view_period' => $view_period,
            'all_params' => $request->all()
        ]);
        $disease_id = $request->disease_id;
        $start_date = $request->start_date;
        $end_date = $request->end_date;

        // Default to today if no date filter is provided AND not viewing specific patient records
        // When viewing patient file (patient_id is set), show all consultations, not just today
        // When searching by patient_name, show all dates (no default)
        $patient_name = $request->patient_name;
        $search = $request->search;
        if (!$start_date && !$end_date && !$patient_to_return && !$to_return_date && $view_period == 'daily' && !$patient_id && !$patient_name && !$search) {
             $start_date = Carbon::today()->format('Y-m-d');
             $end_date = Carbon::today()->format('Y-m-d');
        }

        $data = Consultation::with(['payment_cache_item' => function ($query) {
            $query->with(['payment_cache.check_in.patient' => function ($query2) {
                $query2->with(['region', 'district', 'ward']);
            }]);
            $query->with(['item', 'payment_mode', 'consultant', 'consultation_type']);
        }, 'creator', 'to_optician_sender']);

        if ($with_diagnoses == 'Yes') {
            $data->with(['diagnoses.disease']);
        }

        if ($request->with_items == 'Yes') {
            $data->with(['items' => function($query) {
                $query->with(['item.unit_of_measure', 'consultation_type', 'payment_mode', 'creator', 'server']);
            }]);
        }

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
            if ($status === 'Awaiting Dispensing') {
                // Generic dispensing queue: consultations with any item (non-Pharmacy, non-Procedure)
                // that has not yet been served/dispensed
                $data->whereHas('payment_cache', function ($query) {
                    $query->whereHas('items', function ($itemsQuery) {
                        $itemsQuery->whereHas('item.consultation_type', function ($typeQuery) {
                            $typeQuery->whereNotIn('name', ['Pharmacy', 'Procedure']);
                        })
                        ->where('status', '!=', 'Served'); // Exclude already dispensed items
                    });
                });
            } else if ($status === 'Pending') {
                // For pending consultations, only show those that came from cashier flow
                // (consultations created after payment with consultation items)
                $data->where('status', 'Pending')
                    ->whereHas('payment_cache_item', function ($query) {
                        // Only show consultations for items that require consultation
                        $query->whereHas('item', function ($itemQuery) {
                            $itemQuery->where('is_consultation_item', 'Yes');
                        });
                        // Ensure the payment cache item is paid (came from cashier)
                        $query->where('status', 'Paid');
                    });
            } else {
                $data->where('status', $status);
            }
        }

        if ($require_glass) {
            $data->where('require_glass', $require_glass);
        }

        if ($payment_cache_item_id) {
            $data->where('payment_cache_item_id', $payment_cache_item_id);
        }

        if ($item_id) {
            $data->whereHas('payment_cache_item', function ($query) use ($item_id) {
                $query->where('item_id', $item_id);
            });
        }

        if ($patient_direction) {
            $data->where('patient_direction', $patient_direction);
        }

        if ($consultant_id) {
            $data->whereHas('payment_cache_item', function ($query) use ($consultant_id) {
                $query->where('consultant_id', $consultant_id);
            });
        }

        // Simplified relationship loading for patient records
        if ($patient_id) {
            $data->whereHas('payment_cache_item.payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }
        
        if ($patient_name) {
            $data->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ['%' . $patient_name . '%']);
            });
        }

        if ($patient_gender) {
            $data->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($patient_to_return) {
            $now = Carbon::now()->format('Y-m-d');
            $data->where('patient_to_return', $patient_to_return)
                ->where(function ($query) use ($to_return_date, $now, $view_period) {
                    $query->whereNotNull('to_return_date');

                    if ($to_return_date) {
                        // When specific date is selected, use that date regardless of view_period
                        $query->where('to_return_date', $to_return_date);
                    } else {
                        // Apply view period filtering only when no specific date is selected
                        switch ($view_period) {
                            case 'daily':
                                $query->where('to_return_date', $now);
                                break;
                            case 'weekly':
                                $startOfWeek = Carbon::now()->startOfWeek()->format('Y-m-d');
                                $endOfWeek = Carbon::now()->endOfWeek()->format('Y-m-d');
                                $query->whereBetween('to_return_date', [$startOfWeek, $endOfWeek]);
                                break;
                            case 'monthly':
                                $startOfMonth = Carbon::now()->startOfMonth()->format('Y-m-d');
                                $endOfMonth = Carbon::now()->endOfMonth()->format('Y-m-d');
                                $query->whereBetween('to_return_date', [$startOfMonth, $endOfMonth]);
                                break;
                            default:
                                $query->where('to_return_date', $now);
                        }
                    }
                });
        }

        if ($item_payment_mode_id) {
            $data->whereHas('payment_cache_item', function ($query) use ($item_payment_mode_id) {
                $query->where('payment_mode_id', $item_payment_mode_id);
            });
        }

        if ($disease_id) {
            $data->whereHas('diagnoses', function ($query) use ($disease_id) {
                $query->where('disease_id', $disease_id);
            });
        }

        if ($start_date) {
            if ($status === 'Consulted') {
                $data->where('status', 'Consulted');
                $data->whereDate('updated_at', '>=', $start_date);
            } elseif ($status === 'Pending') {
                // For Pending status, apply date filtering to match notifications logic
                $data->whereDate('created_at', '>=', $start_date);
            } else {
                $data->whereDate('created_at', '>=', $start_date);
            }
        }

        if ($end_date) {
            if ($status === 'Consulted') {
                $data->whereDate('updated_at', '<=', $end_date);
            } elseif ($status === 'Pending') {
                // For Pending status, apply date filtering to match notifications logic
                $data->whereDate('created_at', '<=', $end_date);
            } else {
                $data->whereDate('created_at', '<=', $end_date);
            }
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
        try {
            $request->validate([
                'payment_cache_id' => 'required|exists:patient_payment_cache,id',
                'patient_id' => 'nullable|exists:patients,id',
                'status' => 'nullable|in:Pending,Consulted',
            ]);

            $user = $request->user();
            if (!$user) {
                return $this->sendError('Authentication required.', Response::HTTP_UNAUTHORIZED);
            }

            // Get payment cache with its items
            $paymentCache = \App\Models\PatientPaymentCache::with(['items'])->findOrFail($request->payment_cache_id);

            // Check if there's already a consultation
            if ($paymentCache->consultation_id) {
                $consultation = Consultation::find($paymentCache->consultation_id);
                if ($consultation) {
                    return $this->sendResponse($consultation, Response::HTTP_OK, 'Consultation already exists.');
                }
            }

            // If no existing consultation, check if there are any payment cache items we can use
            $firstItem = $paymentCache->items()->first();

            if (!$firstItem) {
                return $this->sendError('No items found in payment cache. Cannot create consultation.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            // Create consultation using the first payment cache item
            $consultation = Consultation::create([
                'payment_cache_item_id' => $firstItem->id,
                'patient_direction' => $request->patient_direction ?? 'Direct to Doctor',
                'status' => $request->status ?? 'Pending',
                'chief_complaint' => null,
                'history_present_illness' => null,
                'family_history' => null,
                'general_health' => null,
                'patient_to_return' => 'No',
                'to_return_date' => null,
                'remarks' => null,
                'created_by' => $user->id,
            ]);

            // Update payment cache with consultation ID
            $paymentCache->consultation_id = $consultation->id;
            $paymentCache->save();

            return $this->sendResponse($consultation, Response::HTTP_OK, 'Consultation created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->sendError('Validation failed.', Response::HTTP_UNPROCESSABLE_ENTITY, $e->errors());
        } catch (\Throwable $e) {
            \Log::error('Consultation creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return $this->sendError('Failed to create consultation: ' . $e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function addItem(Request $request)
    {
        $request->validate([
            'consultation_id' => 'required|exists:consultations,id',
            'item_id' => 'required|exists:items,id',
            'payment_mode_id' => 'required|exists:payment_modes,id',
            'consultant_id' => 'nullable|exists:users,id',
            'quantity' => 'required|numeric|min:1',
        ]);

        $data = null;
        $user = $request->user();

        $consultation = Consultation::with(['payment_cache_item.payment_cache.check_in.patient'])
            ->find($request->consultation_id);

        if (!$consultation) {
            return $this->sendResponse(null, Response::HTTP_NOT_FOUND, 'Consultation not found.');
        }

        // if item has price for the provided payment mode, continue
        $item = Item::where('id', $request->item_id)
            ->whereHas('prices', function ($query) use ($request) {
                $query->where('payment_mode_id', $request->payment_mode_id);
            })
            ->with([
                'prices' => function ($query) use ($request) {
                $query->where('payment_mode_id', $request->payment_mode_id);
                },
                'consultation_type',
                'item_type',
                'lens_type',
            ])
            ->first();

        if ($item) {
            // if this consultation has payment cache for this user use the existing one, otherwise create new
            $payment_cache = PatientPaymentCache::where('consultation_id', $request->consultation_id)
                ->where('created_by', $user->id)
                ->first();

            if (!$payment_cache) {
                $payment_cache = PatientPaymentCache::create([
                    'check_in_id' => $consultation->payment_cache_item->payment_cache->check_in_id,
                    'consultation_id' => $request->consultation_id,
                    'created_by' => $user->id,
                ]);
            } else {
                $payment_cache->update(['created_at' => Carbon::now()]);
            }

            $data = PatientPaymentCacheItem::create([
                'payment_cache_id' => $payment_cache->id,
                'item_id' => $item->id,
                'consultation_type_id' => $item->consultation_type_id,
                'consultant_id' => $request->consultant_id,
                'payment_mode_id' => $request->payment_mode_id,
                'unit_price' => $item->prices[0]->unit_price,
                'quantity' => $request->quantity,
                'dosage' => $request->dosage,
                'comments' => $request->comments,
                'created_by' => $user->id,
            ]);

            // Ensure response includes freshly created relations
            $data->setRelation('item', $item);
            $data->status = 'Pending';
            $data->loadMissing(['payment_cache.check_in.patient']);

            // Start treatment for patient waiting time tracking
            try {
                $paymentCache = $data->payment_cache;
                $patient = $paymentCache && $paymentCache->check_in
                    ? $paymentCache->check_in->patient
                    : null;

                if ($patient) {
                    $itemCreatedAt = $data->created_at instanceof Carbon
                        ? $data->created_at
                        : Carbon::now();

                    $waitingTime = $patient->waiting_times()
                        ->whereDate('registration_time', $itemCreatedAt->format('Y-m-d'))
                        ->where('status', 'waiting')
                        ->first();

                    if ($waitingTime) {
                        $waitingTime->startTreatment();
                        $waitingTime->sendToConsultation();

                        \Log::info('Started treatment for patient waiting time after adding consultation item', [
                            'patient_id' => $patient->id,
                            'consultation_id' => $request->consultation_id,
                            'waiting_time_id' => $waitingTime->id,
                            'item_id' => $data->id,
                        ]);
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Failed to start treatment for patient waiting time after adding consultation item', [
                    'consultation_id' => $request->consultation_id,
                    'item_id' => $data->id ?? null,
                    'error' => $e->getMessage(),
                ]);
            }

            // Trigger notification refresh so sales/dispensing dashboards update immediately
            try {
                cache()->flush();
                event(new \App\Events\NotificationUpdate());
                \Log::info('Notification refresh triggered after consultation item added', [
                    'consultation_id' => $request->consultation_id,
                    'item_id' => $data->id,
                    'created_by' => $user->id,
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to trigger notification refresh after consultation item added', [
                    'consultation_id' => $request->consultation_id,
                    'item_id' => $data->id ?? null,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Added successfully.');
    }

    public function show(Request $request, $id)
    {
        $with_diagnoses = $request->with_diagnoses;
        $with_items = $request->with_items;
        $with_item_templates = $request->with_item_templates;
        $with_referral = $request->with_referral;
        $with_lab_results = $request->with_lab_results;
        $with_radiology_results = $request->with_radiology_results;
        $with_vital_signs = $request->with_vital_signs;

        try {
            $data = Consultation::with(['payment_cache_item' => function ($query) {
                $query->with(['payment_cache.check_in.patient' => function ($query2) {
                    $query2->with(['region', 'district', 'ward']);
                }, 'payment_mode', 'item', 'consultant']);
            }]);

            $data->with([
                'payment_mode', 'consultant', 'server',
                'creator', 'external_examination', 'functional_tests', 'visual_acuity', 'refraction', 'fundoscopy',
                'to_optician_sender', 'diagnoses.disease'
            ]);

            $data = $data->findOrFail($id);

            if ($with_referral == 'Yes') {
                $data->load(['referral']);
            }

            if ($with_items == 'Yes') {
                $data->items = PatientPaymentCacheItem::with(['item.unit_of_measure', 'consultation_type', 'payment_mode', 'creator', 'server'])
                    ->whereHas('payment_cache', function ($query) use ($id) {
                        $query->where('consultation_id', $id);
                    })
                    ->get();
            }

            if ($with_item_templates == 'Yes') {
                $data->templates = new stdClass();
                $data->templates->surgery_record_report = SurgeryRecordReport::with(['creator'])
                    ->whereHas('payment_cache_item.payment_cache', function ($query) use ($id) {
                        $query->where('consultation_id', $id);
                    })
                    ->first();
                $data->templates->cataract_surgery_record = CataractSurgeryRecord::with(['creator'])
                    ->whereHas('payment_cache_item.payment_cache', function ($query) use ($id) {
                        $query->where('consultation_id', $id);
                    })
                    ->first();
            }

            if ($with_lab_results == 'Yes') {
                $data->lab_results = LabRequest::with(['tests.labTest', 'requestedBy', 'completedBy', 'tests.resultEnteredBy'])
                    ->where('consultation_id', $id)
                    ->orderByDesc('created_at')
                    ->get();
            }

            if ($with_radiology_results == 'Yes') {
                $data->radiology_results = RadiologyRequest::with(['exams.radiologyExam', 'requestedBy', 'completedBy', 'exams.resultEnteredBy'])
                    ->where('consultation_id', $id)
                    ->orderByDesc('created_at')
                    ->get();
            }

            if ($with_vital_signs == 'Yes') {
                $data->vital_signs = VitalSign::with('triagedBy')
                    ->where('consultation_id', $id)
                    ->orderByDesc('created_at')
                    ->get();
            }

            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::info('Consultation not found', [
                'consultation_id' => $id,
            ]);
            return $this->sendResponse(null, Response::HTTP_NOT_FOUND, 'Consultation not found.');
        } catch (\Throwable $e) {
            \Log::error('ConsultationsController@show failed', [
                'error' => $e->getMessage(),
                'consultation_id' => $id,
                'exception_type' => get_class($e),
            ]);
            // Return safe empty payload to keep UI responsive
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Consultation temporarily unavailable.');
        }
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
        try {
            $request->validate([
                'patient_to_return' => 'sometimes|in:Yes,No',
                'to_return_date' => 'nullable|required_if:patient_to_return,Yes|date_format:Y-m-d',
                'status' => 'sometimes|in:Pending,Consulted',
                'require_glass' => 'sometimes|in:Yes,No',
                'send_to_optician' => 'nullable|in:Yes,No',
                'remarks' => 'nullable|string',
                'lens_types' => 'nullable|string',
                'doctor_recommendations' => 'nullable|string',
                'doctor_comments_remarks' => 'nullable|string',
                'patient_direction' => 'nullable|string',
                'refraction' => 'nullable|array',
            ]);

            $data = Consultation::findOrFail($id);
            
            // Exclude refraction and send_to_optician from direct update as they're handled separately
            // Also only update fillable fields to prevent mass assignment errors
            $fillableFields = [
                'patient_to_return', 'to_return_date', 'return_reason', 'status', 
                'require_glass', 'remarks', 'lens_types',
                'doctor_recommendations', 'doctor_comments_remarks', 'patient_direction'
            ];
            $updateData = $request->only($fillableFields);
            
            if (!empty($updateData)) {
                $data->update($updateData);
            }

            // DO NOT automatically complete treatment when consultation is done
            // Treatment should only be completed when patient actually finishes their entire journey
            // (consultation + payment + dispensing + any other required departments)
            if ($request->status === 'Consulted') {
                try {
                    $patient = $data->payment_cache_item->payment_cache->check_in->patient;
                    if ($patient) {
                        $waitingTime = $patient->current_waiting_time;
                        
                        if ($waitingTime && $waitingTime->status === 'in_treatment') {
                            // Keep patient in treatment - they may still need to go to other departments
                            // Treatment will be completed only when they actually finish their journey
                            \Log::info('Consultation completed - keeping patient in treatment', [
                                'patient_id' => $patient->id,
                                'patient_name' => $patient->full_name,
                                'consultation_id' => $data->id,
                                'require_glass' => $data->require_glass,
                                'sent_to_optician' => $data->sent_to_optician_at ? 'Yes' : 'No'
                            ]);
                        }
                    }

                    // Create doctor task from completed consultation
                    try {
                        $doctorTask = \App\Models\DoctorTask::createFromConsultation($data);
                        if ($doctorTask) {
                            \Log::info('Doctor task created from consultation completion', [
                                'consultation_id' => $data->id,
                                'task_id' => $doctorTask->id,
                                'doctor_id' => $doctorTask->doctor_id,
                                'patient_id' => $doctorTask->patient_id
                            ]);
                        }
                    } catch (\Exception $e) {
                        \Log::error('Failed to create doctor task from consultation', [
                            'consultation_id' => $data->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::error('Failed to check patient waiting time status', [
                        'consultation_id' => $data->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            if ($request->refraction && is_array($request->refraction) && !empty(array_filter($request->refraction))) {
                $user = $request->user();
                try {
                    if ($data->refraction) {
                        $data->refraction->update($request->refraction);
                    } else {
                        $refractionInput = $request->refraction;
                        $refractionInput['consultation_id'] = $id;
                        $refractionInput['created_by'] = $user->id;
                        ConsultationRefraction::create($refractionInput);
                    }
                } catch (\Exception $e) {
                    \Log::error('Failed to update/create refraction', [
                        'consultation_id' => $id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    // Don't fail the entire request if refraction fails
                }
            }

            // Reload the consultation with relationships for response
            try {
                $data->refresh();
                $data->load(['refraction', 'payment_cache_item.payment_cache.check_in.patient']);
            } catch (\Exception $e) {
                \Log::warning('Failed to reload consultation relationships', [
                    'consultation_id' => $id,
                    'error' => $e->getMessage()
                ]);
                // Continue without loading relationships - data is already updated
            }
            
            return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('ConsultationsController@update validation failed', [
                'consultation_id' => $id,
                'errors' => $e->errors(),
                'request_data' => $request->except(['password', 'token']),
            ]);
            return $this->sendError('Validation failed.', Response::HTTP_UNPROCESSABLE_ENTITY, $e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Consultation not found for update', [
                'consultation_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->sendError('Consultation not found.', Response::HTTP_NOT_FOUND);
        } catch (\Throwable $e) {
            \Log::error('ConsultationsController@update failed', [
                'error' => $e->getMessage(),
                'consultation_id' => $id,
                'exception_type' => get_class($e),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['password', 'token']),
            ]);
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Failed to update consultation: ' . $e->getMessage());
        }
    }

    public function autoSaveClinicalNotes(Request $request, $id)
    {
        try {
            $request->validate([
                'what' => 'required|in:Consultation,Visual Acuity,External Examination,Functional Test,Refraction,Fundoscopy'
            ]);

            $user = $request->user();
            $data = Consultation::findOrFail($id);

            switch ($request->what) {
                case 'Consultation': {
                    $request->validate([
                        'chief_complaint' => 'nullable|string',
                        'history_present_illness' => 'nullable|string',
                        'family_history' => 'nullable|string',
                        'general_health' => 'nullable|string',
                        'patient_to_return' => 'sometimes|required|in:Yes,No',
                        'to_return_date' => 'nullable|date_format:Y-m-d',
                        'return_reason' => 'nullable|string',
                        'require_glass' => 'sometimes|required|in:Yes,No',
                        'lens_types' => 'nullable|string',
                        'remarks' => 'nullable|string',
                        'doctor_recommendations' => 'nullable|string',
                        'doctor_comments_remarks' => 'nullable|string',
                    ]);
                    // Only update fillable fields - include all consultation fields
                    $fillableFields = [
                        'chief_complaint', 
                        'history_present_illness', 
                        'family_history', 
                        'general_health',
                        'patient_to_return', 
                        'to_return_date', 
                        'return_reason', 
                        'require_glass', 
                        'lens_types', 
                        'remarks', 
                        'doctor_recommendations', 
                        'doctor_comments_remarks'
                    ];
                    $updateData = $request->only($fillableFields);
                    // Remove null values that weren't in the request to avoid overwriting existing data
                    $updateData = array_filter($updateData, function($key) use ($request) {
                        return $request->has($key);
                    }, ARRAY_FILTER_USE_KEY);
                    $data->update($updateData);
                }
                break;
                case 'External Examination': {
                    if ($data->external_examination) {
                        $data->external_examination->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationExternalExamination::create($input);
                    }
                }
                break;
                case 'Functional Test': {
                    if ($data->functional_tests) {
                        $data->functional_tests->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationFunctionalTest::create($input);
                    }
                }
                break;
                case 'Visual Acuity': {
                    if ($data->visual_acuity) {
                        $data->visual_acuity->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationVisualAcuity::create($input);
                    }
                }
                break;
                case 'Refraction': {
                    if ($data->refraction) {
                        $data->refraction->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationRefraction::create($input);
                    }
                }
                break;
                case 'Fundoscopy': {
                    if ($data->fundoscopy) {
                        $data->fundoscopy->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationFundoscopy::create($input);
                    }
                }
                break;
            }

            // Reload the consultation with relationships for response
            try {
                $data->refresh();
                $data->load(['payment_cache_item.payment_cache.check_in.patient']);
            } catch (\Exception $e) {
                \Log::warning('Failed to reload consultation relationships after auto-save', [
                    'consultation_id' => $id,
                    'error' => $e->getMessage()
                ]);
            }
            
            \Log::info('Clinical notes auto-saved successfully', [
                'consultation_id' => $id,
                'what' => $request->what,
                'fields_updated' => array_keys($updateData ?? [])
            ]);
            
            return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::info('Consultation not found for auto-save', [
                'consultation_id' => $id,
            ]);
            return $this->sendResponse(null, Response::HTTP_NOT_FOUND, 'Consultation not found.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('ConsultationsController@autoSaveClinicalNotes validation failed', [
                'error' => $e->getMessage(),
                'errors' => $e->errors(),
                'consultation_id' => $id,
                'request_data' => $request->except(['password', 'token']),
            ]);
            return $this->sendResponse(null, Response::HTTP_UNPROCESSABLE_ENTITY, 'Validation failed: ' . $e->getMessage());
        } catch (\Throwable $e) {
            \Log::error('ConsultationsController@autoSaveClinicalNotes failed', [
                'error' => $e->getMessage(),
                'consultation_id' => $id,
                'exception_type' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['password', 'token']),
            ]);
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Failed to auto-save clinical notes: ' . $e->getMessage());
        }
    }

    public function completeClinicalNotes(Request $request, $id)
    {
        try {
            $request->validate([
                'patient_to_return' => 'nullable|in:Yes,No',
                'to_return_date' => 'nullable|required_if:patient_to_return,Yes|date_format:Y-m-d',
                'return_reason' => 'nullable|string',
                'require_glass' => 'nullable|in:Yes,No',
                'info_source_id' => 'nullable|exists:information_sources,id',
            ]);

            $user = $request->user();
            $data = Consultation::findOrFail($id);
            // Note: family_ocular_history and family_general_history removed - columns don't exist in database
            $input = $request->only('chief_complaint', 'history_present_illness', 'family_history', 'general_health', 'patient_to_return', 'to_return_date', 'return_reason', 'remarks', 'require_glass', 'lens_types', 'doctor_recommendations', 'doctor_comments_remarks');
            $input['status'] = 'Consulted';

            $data->update($input);

            // Update related models only if they exist
            if ($request->visual_acuity) {
                if ($data->visual_acuity) {
                    $data->visual_acuity->update($request->visual_acuity);
                } else {
                    $visualAcuityInput = $request->visual_acuity;
                    $visualAcuityInput['consultation_id'] = $id;
                    $visualAcuityInput['created_by'] = $user->id;
                    ConsultationVisualAcuity::create($visualAcuityInput);
                }
            }

            if ($request->external_examination) {
                if ($data->external_examination) {
                    $data->external_examination->update($request->external_examination);
                } else {
                    $externalExamInput = $request->external_examination;
                    $externalExamInput['consultation_id'] = $id;
                    $externalExamInput['created_by'] = $user->id;
                    ConsultationExternalExamination::create($externalExamInput);
                }
            }

            if ($request->functional_tests) {
                if ($data->functional_tests) {
                    $data->functional_tests->update($request->functional_tests);
                } else {
                    $functionalTestsInput = $request->functional_tests;
                    $functionalTestsInput['consultation_id'] = $id;
                    $functionalTestsInput['created_by'] = $user->id;
                    ConsultationFunctionalTest::create($functionalTestsInput);
                }
            }

            if ($request->refraction) {
                if ($data->refraction) {
                    $data->refraction->update($request->refraction);
                } else {
                    $refractionInput = $request->refraction;
                    $refractionInput['consultation_id'] = $id;
                    $refractionInput['created_by'] = $user->id;
                    ConsultationRefraction::create($refractionInput);
                }
            }

            if ($request->fundoscopy) {
                if ($data->fundoscopy) {
                    $data->fundoscopy->update($request->fundoscopy);
                } else {
                    $fundoscopyInput = $request->fundoscopy;
                    $fundoscopyInput['consultation_id'] = $id;
                    $fundoscopyInput['created_by'] = $user->id;
                    ConsultationFundoscopy::create($fundoscopyInput);
                }
            }

            // Update payment cache item status and consultant
            if ($data->payment_cache_item) {
                $data->payment_cache_item->update([
                    'consultant_id' => $user->id,
                ]);

                // Update balances for stock items and medicines if they exist (optimized)
                $paymentCacheItem = $data->payment_cache_item;
                if ($paymentCacheItem->item && $paymentCacheItem->item->is_stock_item == 'Yes') {
                    // Use direct database update for better performance
                    DB::table('items')
                        ->where('id', $paymentCacheItem->item_id)
                        ->decrement('balance', $paymentCacheItem->quantity);
                }
                
                // Update balance for medicines (optimized)
                if ($paymentCacheItem->medicine) {
                    // Use direct database update for better performance
                    DB::table('medicines')
                        ->where('id', $paymentCacheItem->medicine_id)
                        ->decrement('balance', $paymentCacheItem->quantity);
                }
            }

            // Check if patient waiting time should be completed after consultation (optimized)
            try {
                if (!$data->payment_cache_item || !$data->payment_cache_item->payment_cache || !$data->payment_cache_item->payment_cache->check_in) {
                    \Log::warning('Missing payment cache or check-in relationship', [
                        'consultation_id' => $data->id
                    ]);
                } else {
                    $patient = $data->payment_cache_item->payment_cache->check_in->patient;
                if ($patient) {
                    // Use a more efficient query with eager loading
                    $waitingTime = $patient->waiting_times()
                        ->whereDate('registration_time', $data->created_at->format('Y-m-d'))
                        ->where('status', 'in_treatment')
                        ->first();
                        
                    if ($waitingTime && $waitingTime->hasCompletedFullJourney()) {
                        $waitingTime->endTreatment();
                        
                        \Log::info('Auto-completed patient treatment after consultation completion', [
                            'patient_id' => $patient->id,
                            'patient_name' => $patient->name ?? 'Unknown',
                            'current_department' => $waitingTime->current_department,
                            'consultation_id' => $data->id
                        ]);
                    }
                }
                }
            } catch (\Exception $e) {
                \Log::error('Failed to check patient waiting time for completion', [
                    'consultation_id' => $data->id,
                    'error' => $e->getMessage()
                ]);
            }

            // send message to patient (dispatch to queue to avoid timeout)
            if ($data->patient_direction == 'Direct to Doctor') {
                // Dispatch the job asynchronously to prevent timeout
                try {
                    // Use dispatch instead of dispatch()->onQueue() to avoid queue configuration issues
                    SendConsultationMessageJob::dispatch($data);
                } catch (\Exception $e) {
                    // Log the error but don't fail the request
                    \Log::warning('Failed to dispatch SMS job', [
                        'consultation_id' => $data->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // update source of information
            if ($request->info_source_id && $data->payment_cache_item && $data->payment_cache_item->payment_cache && $data->payment_cache_item->payment_cache->check_in) {
                $patient = $data->payment_cache_item->payment_cache->check_in->patient;
                if ($patient) {
                    $patient->info_source_id = $request->info_source_id;
                    $patient->save();
                }
            }

            // Trigger notification refresh for real-time updates
            try {
                event(new \App\Events\NotificationUpdate());
                \Log::info('Consultation completed - notification refresh triggered', [
                    'consultation_id' => $data->id,
                    'patient_id' => $data->patient->id ?? 'Unknown',
                    'status' => $data->status
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to trigger notification refresh after consultation completion', [
                    'consultation_id' => $data->id,
                    'error' => $e->getMessage()
                ]);
            }

            \Log::info('Clinical notes completed successfully', [
                'consultation_id' => $data->id,
                'patient_id' => $data->patient->id ?? 'Unknown',
                'user_id' => $user->id,
                'status' => $data->status
            ]);

            return $this->sendResponse($data, Response::HTTP_OK, 'Clinical notes saved successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::info('Consultation not found for complete clinical notes', [
                'consultation_id' => $id,
            ]);
            return $this->sendResponse(null, Response::HTTP_NOT_FOUND, 'Consultation not found.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('ConsultationsController@completeClinicalNotes validation failed', [
                'error' => $e->getMessage(),
                'errors' => $e->errors(),
                'consultation_id' => $id,
                'request_data' => $request->except(['password', 'token']),
            ]);
            return $this->sendResponse(null, Response::HTTP_UNPROCESSABLE_ENTITY, 'Validation failed: ' . $e->getMessage());
        } catch (\Throwable $e) {
            \Log::error('ConsultationsController@completeClinicalNotes failed', [
                'error' => $e->getMessage(),
                'consultation_id' => $id,
                'exception_type' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['password', 'token']),
            ]);
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Failed to complete clinical notes: ' . $e->getMessage());
        }
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
}
