<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Referral;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReferralsController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
            'consultation_id' => 'sometimes|integer',
            'patient_id' => 'sometimes|integer',
            'status' => 'sometimes|in:Pending,Sent,Acknowledged,Completed',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $consultation_id = $request->consultation_id;
        $patient_id = $request->patient_id;
        $status = $request->status;

        $data = Referral::with([
            'consultation.payment_cache_item.payment_cache.check_in.patient',
            'patient',
            'creator',
        ]);

        // Filter by clinic if user is not admin
        if (!$user->is_admin) {
            $data->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
        }

        if ($consultation_id) {
            $data->where('consultation_id', $consultation_id);
        }

        if ($patient_id) {
            $data->where('patient_id', $patient_id);
        }

        if ($status) {
            $data->where('status', $status);
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        $data = $data->orderBy('created_at', 'desc')->paginate($per_page);

        return $this->sendResponse($data, 200, 'Success.');
    }

    /**
     * Get referrals for a specific patient
     */
    public function getPatientReferrals(Request $request, $patient_id)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Pending,Sent,Acknowledged,Completed',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $status = $request->status;

        $data = Referral::with([
            'consultation.payment_cache_item.payment_cache.check_in.patient',
            'patient',
            'creator',
        ])->where('patient_id', $patient_id);

        // Filter by clinic if user is not admin
        if (!$user->is_admin) {
            $data->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
        }

        if ($status) {
            $data->where('status', $status);
        }

        $referrals = $data->orderBy('created_at', 'desc')->paginate($per_page);

        return $this->sendResponse($referrals, 200, 'Patient referrals retrieved successfully');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'consultation_id' => 'required|integer|exists:consultations,id',
                'referral_reason' => 'required|string',
                'clinical_summary' => 'required|string',
                'status' => 'nullable|in:Pending,Sent,Acknowledged,Completed',
                'referral_date' => 'nullable|date_format:Y-m-d',
            ]);

            // Get consultation with patient relationship
            $consultationModel = \App\Models\Consultation::with([
                'payment_cache_item.payment_cache.check_in.patient'
            ])->find($request->consultation_id);

            if (!$consultationModel) {
                return $this->sendError('Consultation not found', 404);
            }

            // Try to get patient_id from the relationship chain
            $patientId = null;
            if ($consultationModel->payment_cache_item) {
                if ($consultationModel->payment_cache_item->payment_cache) {
                    if ($consultationModel->payment_cache_item->payment_cache->check_in) {
                        $patientId = $consultationModel->payment_cache_item->payment_cache->check_in->patient_id;
                    }
                }
            }

            // Fallback: Try direct database query if relationship doesn't work
            if (!$patientId) {
                try {
                    $consultation = DB::table('consultations')
                        ->join('patient_payment_cache_items', 'consultations.payment_cache_item_id', '=', 'patient_payment_cache_items.id')
                        ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                        ->join('patient_check_ins', 'patient_payment_cache.check_in_id', '=', 'patient_check_ins.id')
                        ->where('consultations.id', $request->consultation_id)
                        ->select('patient_check_ins.patient_id')
                        ->first();

                    if ($consultation) {
                        $patientId = $consultation->patient_id;
                    }
                } catch (\Exception $e) {
                    \Log::error('Database query failed in referral store', [
                        'error' => $e->getMessage(),
                        'consultation_id' => $request->consultation_id
                    ]);
                }
            }

            if (!$patientId) {
                \Log::error('Failed to get patient_id for referral', [
                    'consultation_id' => $request->consultation_id,
                    'request_data' => $request->all()
                ]);
                return $this->sendError('Unable to determine patient for this consultation', 500);
            }

            $referral = Referral::create([
                'consultation_id' => $request->consultation_id,
                'patient_id' => $patientId,
                'referred_to_name' => 'External Referral',
                'referred_to_type' => null,
                'referral_reason' => $request->referral_reason,
                'clinical_summary' => $request->clinical_summary,
                'status' => $request->status ?? 'Pending',
                'referral_date' => $request->referral_date ?? now()->format('Y-m-d'),
                'appointment_date' => null,
                'notes' => null,
                'created_by' => $request->user()->id,
            ]);

            $referral->load(['consultation', 'patient', 'creator']);

            return $this->sendResponse($referral, 201, 'Referral created successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Referral validation failed', [
                'errors' => $e->errors(),
                'request' => $request->all()
            ]);
            return $this->sendError('Validation failed', 422, $e->errors());
        } catch (\Throwable $e) {
            \Log::error('Failed to create referral', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return $this->sendError('Failed to create referral: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $referral = Referral::with([
            'consultation.payment_cache_item.payment_cache.check_in.patient',
            'patient',
            'creator',
        ])->findOrFail($id);

        return $this->sendResponse($referral, 200, 'Success.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'referred_to_name' => 'sometimes|string|max:255',
            'referred_to_type' => 'nullable|string|max:255',
            'referral_reason' => 'nullable|string',
            'clinical_summary' => 'nullable|string',
            'status' => 'sometimes|in:Pending,Sent,Acknowledged,Completed',
            'referral_date' => 'nullable|date_format:Y-m-d',
            'appointment_date' => 'nullable|date_format:Y-m-d',
            'notes' => 'nullable|string',
        ]);

        $referral = Referral::findOrFail($id);
        $referral->update($request->only([
            'referred_to_name',
            'referred_to_type',
            'referral_reason',
            'clinical_summary',
            'status',
            'referral_date',
            'appointment_date',
            'notes',
        ]));

        $referral->load(['consultation', 'patient', 'creator']);

        return $this->sendResponse($referral, 200, 'Referral updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $referral = Referral::findOrFail($id);
        $referral->delete();

        return $this->sendResponse(null, 200, 'Referral deleted successfully');
    }
}
