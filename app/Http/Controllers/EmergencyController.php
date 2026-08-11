<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Admission;
use App\Models\Bed;
use App\Models\ErVisit;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class EmergencyController extends Controller
{
    use ApiResponse;

    /**
     * ER dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $today = now()->toDateString();

        $query = ErVisit::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id));

        $todayQuery = (clone $query)->whereDate('arrival_time', $today);

        $summary = [
            'waiting' => (clone $query)->where('status', 'Waiting')->count(),
            'in_treatment' => (clone $query)->where('status', 'In-Treatment')->count(),
            'today_visits' => (clone $todayQuery)->count(),
            'admitted_today' => (clone $todayQuery)->where('disposition', 'Admitted')->count(),
            'critical' => (clone $query)->where('status', 'In-Treatment')->where('priority', 'Critical')->count(),
            'total' => (clone $query)->count(),
            'date' => $today,
        ];

        return $this->sendResponse($summary, Response::HTTP_OK, 'ER dashboard retrieved successfully.');
    }

    /**
     * List ER visits.
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Waiting,In-Treatment,Admitted,Discharged,Referred,Cancelled',
            'priority' => 'sometimes|in:Stable,Serious,Critical',
            'q' => 'sometimes|string|max:100',
            'date' => 'sometimes|date',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = ErVisit::with(['patient', 'triagedBy', 'doctor', 'nurse', 'admission'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->priority, fn ($q, $p) => $q->where('priority', $p))
            ->when($request->date, fn ($q, $d) => $q->whereDate('arrival_time', $d))
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('visit_no', 'like', "%{$search}%")
                        ->orWhere('chief_complaint', 'like', "%{$search}%")
                        ->orWhere('diagnosis', 'like', "%{$search}%")
                        ->orWhereHas('patient', function ($p) use ($search) {
                            $p->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByRaw("FIELD(status, 'Waiting', 'In-Treatment') ASC, arrival_time DESC")
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'ER visits retrieved successfully.');
    }

    /**
     * Show a single ER visit.
     */
    public function show(Request $request, $id)
    {
        $item = ErVisit::with(['patient', 'triagedBy', 'doctor', 'nurse', 'admission.bed', 'admission.ward'])
            ->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'ER visit retrieved successfully.');
    }

    /**
     * Create a new ER visit.
     */
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'triage_category' => 'nullable|in:General,Urgent,Emergency',
            'priority' => 'nullable|in:Stable,Serious,Critical',
            'arrival_time' => 'nullable|date',
            'chief_complaint' => 'nullable|string',
            'history' => 'nullable|string',
            'nurse_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $visitNo = 'ER-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $item = ErVisit::create([
            'visit_no' => $visitNo,
            'clinic_id' => $clinic_id,
            'patient_id' => $request->patient_id,
            'triaged_by' => $user->id,
            'nurse_id' => $request->nurse_id,
            'arrival_time' => $request->arrival_time ? \Carbon\Carbon::parse($request->arrival_time) : now(),
            'triage_category' => $request->triage_category ?? 'General',
            'priority' => $request->priority ?? 'Stable',
            'chief_complaint' => $request->chief_complaint,
            'history' => $request->history,
            'notes' => $request->notes,
            'status' => 'Waiting',
        ]);

        return $this->sendResponse(
            $item->load(['patient', 'triagedBy', 'doctor', 'nurse']),
            Response::HTTP_CREATED,
            'ER visit created successfully.'
        );
    }

    /**
     * Update an ER visit (clinical assessment).
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'doctor_id' => 'nullable|exists:users,id',
            'nurse_id' => 'nullable|exists:users,id',
            'triage_category' => 'nullable|in:General,Urgent,Emergency',
            'priority' => 'nullable|in:Stable,Serious,Critical',
            'chief_complaint' => 'nullable|string',
            'history' => 'nullable|string',
            'assessment' => 'nullable|string',
            'diagnosis' => 'nullable|string',
            'treatment' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:Waiting,In-Treatment,Admitted,Discharged,Referred,Cancelled',
            'seen_time' => 'nullable|date',
        ]);

        $item = ErVisit::findOrFail($id);

        $data = $request->only([
            'doctor_id', 'nurse_id', 'triage_category', 'priority', 'chief_complaint',
            'history', 'assessment', 'diagnosis', 'treatment', 'notes', 'status',
        ]);

        if ($request->has('seen_time')) {
            $data['seen_time'] = $request->seen_time ? \Carbon\Carbon::parse($request->seen_time) : $item->seen_time;
        }

        $item->update($data);

        return $this->sendResponse(
            $item->load(['patient', 'triagedBy', 'doctor', 'nurse', 'admission']),
            Response::HTTP_OK,
            'ER visit updated successfully.'
        );
    }

    /**
     * Start treating a visit.
     */
    public function startTreatment(Request $request, $id)
    {
        $user = $request->user();
        $item = ErVisit::findOrFail($id);

        if ($item->status !== 'Waiting') {
            return $this->sendError('Only waiting visits can start treatment.', Response::HTTP_CONFLICT);
        }

        $item->update([
            'status' => 'In-Treatment',
            'doctor_id' => $item->doctor_id ?? $user->id,
            'seen_time' => $item->seen_time ?? now(),
        ]);

        return $this->sendResponse($item, Response::HTTP_OK, 'Treatment started successfully.');
    }

    /**
     * Admit an ER patient to a ward bed.
     */
    public function admit(Request $request, $id)
    {
        $request->validate([
            'bed_id' => 'required|exists:beds,id',
            'doctor_id' => 'nullable|exists:users,id',
            'admission_reason' => 'nullable|string|max:255',
            'diagnosis' => 'nullable|string',
            'condition' => 'nullable|in:Stable,Serious,Critical',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $visit = ErVisit::with('patient')->findOrFail($id);

        if (!in_array($visit->status, ['Waiting', 'In-Treatment'])) {
            return $this->sendError('Only active visits can be admitted.', Response::HTTP_CONFLICT);
        }

        $bed = Bed::with('ward')->findOrFail($request->bed_id);

        if ($bed->status === 'Occupied') {
            return $this->sendError('The selected bed is already occupied.', Response::HTTP_CONFLICT);
        }

        $activeAdmission = Admission::where('patient_id', $visit->patient_id)
            ->where('status', 'Admitted')
            ->exists();

        if ($activeAdmission) {
            return $this->sendError('This patient already has an active admission.', Response::HTTP_CONFLICT);
        }

        $admissionNo = 'AD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $result = DB::transaction(function () use ($request, $user, $bed, $admissionNo, $visit) {
            $admission = Admission::create([
                'admission_no' => $admissionNo,
                'clinic_id' => $bed->clinic_id ?? $user->clinic_id,
                'patient_id' => $visit->patient_id,
                'hospital_ward_id' => $bed->hospital_ward_id,
                'bed_id' => $bed->id,
                'admitted_by' => $user->id,
                'doctor_id' => $request->doctor_id ?? $visit->doctor_id,
                'admission_date' => now(),
                'admission_reason' => $request->admission_reason ?? $visit->chief_complaint,
                'diagnosis' => $request->diagnosis ?? $visit->diagnosis,
                'condition' => $request->condition ?? $visit->priority,
                'notes' => $request->notes,
                'status' => 'Admitted',
            ]);

            $bed->status = 'Occupied';
            $bed->patient_id = $visit->patient_id;
            $bed->save();

            $visit->update([
                'status' => 'Admitted',
                'disposition' => 'Admitted',
                'admission_id' => $admission->id,
                'discharge_time' => now(),
            ]);

            return $admission;
        });

        return $this->sendResponse(
            $result->load(['patient', 'ward', 'bed', 'admittedBy', 'doctor']),
            Response::HTTP_CREATED,
            'Patient admitted from ER successfully.'
        );
    }

    /**
     * Discharge an ER visit.
     */
    public function discharge(Request $request, $id)
    {
        $request->validate([
            'outcome' => 'nullable|string',
            'referral_to' => 'nullable|string|max:255',
        ]);

        $item = ErVisit::findOrFail($id);

        if (!in_array($item->status, ['Waiting', 'In-Treatment'])) {
            return $this->sendError('Only active visits can be discharged.', Response::HTTP_CONFLICT);
        }

        $item->update([
            'status' => $request->referral_to ? 'Referred' : 'Discharged',
            'disposition' => $request->referral_to ? 'Referred' : 'Discharged',
            'referral_to' => $request->referral_to,
            'outcome' => $request->outcome,
            'discharge_time' => now(),
        ]);

        return $this->sendResponse($item, Response::HTTP_OK, 'ER visit closed successfully.');
    }

    /**
     * Get a patient's ER history.
     */
    public function patientHistory(Request $request, $patientId)
    {
        $items = ErVisit::with(['doctor', 'nurse'])
            ->where('patient_id', $patientId)
            ->orderByDesc('arrival_time')
            ->get();

        return $this->sendResponse($items, Response::HTTP_OK, 'ER history retrieved successfully.');
    }

    /**
     * List active staff by role (for ER assignment without employee_management privilege).
     */
    public function staff(Request $request)
    {
        $request->validate([
            'role' => 'sometimes|string|max:50',
        ]);

        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = \App\Models\User::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->role, fn ($q, $role) => $q->where('role', $role))
            ->where('status', 'Active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'middle_name', 'last_name', 'role', 'phone']);

        return $this->sendResponse($items, Response::HTTP_OK, 'Staff retrieved successfully.');
    }
}
