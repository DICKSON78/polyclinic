<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Patient;
use App\Models\PatientCheckIn;
use App\Models\VitalSign;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class TriageController extends Controller
{
    use ApiResponse;

    /**
     * Get the triage dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $today = Carbon::today();

        $queued = PatientCheckIn::whereDate('created_at', $today)
            ->when($clinic_id, fn ($q) => $q->whereHas('creator', fn ($q) => $q->where('clinic_id', $clinic_id)))
            ->whereHas('patient.consultations', fn ($q) => $q->where('status', 'Pending'))
            ->count();

        $awaitingTriage = PatientCheckIn::whereDate('created_at', $today)
            ->when($clinic_id, fn ($q) => $q->whereHas('creator', fn ($q) => $q->where('clinic_id', $clinic_id)))
            ->whereDoesntHave('patient.vitalSigns', fn ($q) => $q->whereDate('created_at', $today))
            ->count();

        $triagedToday = VitalSign::whereDate('created_at', $today)
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $urgent = VitalSign::whereDate('created_at', $today)
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->whereIn('triage_category', ['Urgent', 'Emergency'])
            ->count();

        $averageWait = VitalSign::whereDate('created_at', $today)
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->avg(DB::raw('TIMESTAMPDIFF(MINUTE, created_at, updated_at)'));

        return $this->sendResponse([
            'queued_patients' => (int) $queued,
            'awaiting_triage' => (int) $awaitingTriage,
            'triaged_today' => (int) $triagedToday,
            'urgent_cases' => (int) $urgent,
            'average_wait_minutes' => round((float) $averageWait ?: 0),
            'date' => $today->toDateString(),
        ], Response::HTTP_OK, 'Triage dashboard retrieved successfully.');
    }

    /**
     * Get the list of patients awaiting triage (recent check-ins without vitals).
     */
    public function queue(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $today = Carbon::today();
        $status = $request->get('status', 'awaiting');

        $query = PatientCheckIn::with(['patient', 'creator'])
            ->whereDate('patient_check_ins.created_at', $today)
            ->when($clinic_id, fn ($q) => $q->whereHas('creator', fn ($q) => $q->where('clinic_id', $clinic_id)));

        if ($status === 'awaiting') {
            $query->whereDoesntHave('patient.vitalSigns', fn ($q) => $q->whereDate('created_at', $today));
        } elseif ($status === 'triaged') {
            $query->whereHas('patient.vitalSigns', fn ($q) => $q->whereDate('created_at', $today));
        }

        $items = $query->orderByDesc('patient_check_ins.created_at')->get();

        $items->each(function ($checkIn) use ($today) {
            $checkIn->vital_signs_today = $checkIn->patient
                ? $checkIn->patient->vitalSigns()->whereDate('created_at', $today)->exists()
                : false;
        });

        return $this->sendResponse($items, Response::HTTP_OK, 'Triage queue retrieved successfully.');
    }

    /**
     * Record vital signs for a patient.
     */
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'temperature' => 'nullable|numeric',
            'systolic_bp' => 'nullable|integer',
            'diastolic_bp' => 'nullable|integer',
            'heart_rate' => 'nullable|integer',
            'respiratory_rate' => 'nullable|integer',
            'oxygen_saturation' => 'nullable|integer|between:0,100',
            'weight_kg' => 'nullable|numeric',
            'height_cm' => 'nullable|numeric',
            'blood_group' => 'nullable|string|max:10',
            'chief_complaint' => 'nullable|string',
            'triage_category' => 'nullable|in:General,Urgent,Emergency',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $data = $request->only([
            'patient_id', 'consultation_id', 'temperature', 'systolic_bp', 'diastolic_bp',
            'heart_rate', 'respiratory_rate', 'oxygen_saturation', 'weight_kg', 'height_cm',
            'blood_group', 'chief_complaint', 'triage_category', 'notes',
        ]);

        $data['clinic_id'] = $user->clinic_id;
        $data['triaged_by'] = $user->id;

        $heightM = null;
        if (!empty($data['height_cm']) && $data['height_cm'] > 0) {
            $heightM = $data['height_cm'] / 100;
        }
        if (!empty($data['weight_kg']) && $heightM) {
            $data['bmi'] = round($data['weight_kg'] / ($heightM * $heightM), 2);
        }

        $vitalSign = VitalSign::create($data);

        return $this->sendResponse($vitalSign->load(['patient', 'triagedBy']), Response::HTTP_CREATED, 'Vital signs recorded successfully.');
    }

    /**
     * Get vital signs history for a patient.
     */
    public function patientHistory(Request $request, $patientId)
    {
        $items = VitalSign::with(['triagedBy'])
            ->where('patient_id', $patientId)
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 20));

        return $this->sendResponse($items, Response::HTTP_OK, 'Vital signs history retrieved successfully.');
    }

    /**
     * Get a single vital sign record.
     */
    public function show(Request $request, $id)
    {
        $vitalSign = VitalSign::with(['patient', 'consultation', 'triagedBy'])->findOrFail($id);
        return $this->sendResponse($vitalSign, Response::HTTP_OK, 'Vital sign retrieved successfully.');
    }

    /**
     * Update a vital sign record.
     */
    public function update(Request $request, $id)
    {
        $vitalSign = VitalSign::findOrFail($id);

        $request->validate([
            'temperature' => 'nullable|numeric',
            'systolic_bp' => 'nullable|integer',
            'diastolic_bp' => 'nullable|integer',
            'heart_rate' => 'nullable|integer',
            'respiratory_rate' => 'nullable|integer',
            'oxygen_saturation' => 'nullable|integer|between:0,100',
            'weight_kg' => 'nullable|numeric',
            'height_cm' => 'nullable|numeric',
            'blood_group' => 'nullable|string|max:10',
            'chief_complaint' => 'nullable|string',
            'triage_category' => 'nullable|in:General,Urgent,Emergency',
            'notes' => 'nullable|string',
        ]);

        $data = $request->only([
            'temperature', 'systolic_bp', 'diastolic_bp', 'heart_rate', 'respiratory_rate',
            'oxygen_saturation', 'weight_kg', 'height_cm', 'blood_group', 'chief_complaint',
            'triage_category', 'notes',
        ]);

        $heightM = null;
        if (!empty($data['height_cm']) && $data['height_cm'] > 0) {
            $heightM = $data['height_cm'] / 100;
        }
        if (!empty($data['weight_kg']) && $heightM) {
            $data['bmi'] = round($data['weight_kg'] / ($heightM * $heightM), 2);
        }

        $vitalSign->update($data);

        return $this->sendResponse($vitalSign->load(['patient', 'triagedBy']), Response::HTTP_OK, 'Vital signs updated successfully.');
    }

    /**
     * Delete a vital sign record.
     */
    public function destroy(Request $request, $id)
    {
        $vitalSign = VitalSign::findOrFail($id);
        $vitalSign->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Vital sign record deleted successfully.');
    }
}
