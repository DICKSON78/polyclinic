<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Admission;
use App\Models\OperatingTheatre;
use App\Models\Surgery;
use App\Models\SurgicalNote;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class OperatingTheatreController extends Controller
{
    use ApiResponse;

    /**
     * Theatre dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $query = Surgery::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id));

        $today = now()->toDateString();

        $summary = [
            'scheduled' => (clone $query)->where('status', 'Scheduled')->count(),
            'ready' => (clone $query)->where('status', 'Ready')->count(),
            'in_progress' => (clone $query)->where('status', 'In-Progress')->count(),
            'completed_today' => (clone $query)->where('status', 'Completed')->whereDate('ended_at', $today)->count(),
            'upcoming_today' => (clone $query)->whereDate('scheduled_at', $today)->whereNotIn('status', ['Completed', 'Cancelled'])->count(),
            'total' => (clone $query)->count(),
            'theatres' => OperatingTheatre::query()
                ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
                ->count(),
            'active_theatres' => OperatingTheatre::query()
                ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
                ->where('status', 'Active')
                ->count(),
            'date' => $today,
        ];

        return $this->sendResponse($summary, Response::HTTP_OK, 'Theatre dashboard retrieved successfully.');
    }

    /**
     * List operating theatres.
     */
    public function theatres(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Active,Inactive,Maintenance',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = OperatingTheatre::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->q, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Theatres retrieved successfully.');
    }

    /**
     * Create a new operating theatre.
     */
    public function storeTheatre(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'equipment_notes' => 'nullable|string|max:255',
            'status' => 'nullable|in:Active,Inactive,Maintenance',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $item = OperatingTheatre::create([
            'clinic_id' => $user->clinic_id,
            'name' => $request->name,
            'location' => $request->location,
            'equipment_notes' => $request->equipment_notes,
            'status' => $request->status ?? 'Active',
            'notes' => $request->notes,
        ]);

        return $this->sendResponse($item, Response::HTTP_CREATED, 'Theatre created successfully.');
    }

    /**
     * Update an operating theatre.
     */
    public function updateTheatre(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'equipment_notes' => 'nullable|string|max:255',
            'status' => 'nullable|in:Active,Inactive,Maintenance',
            'notes' => 'nullable|string',
        ]);

        $item = OperatingTheatre::findOrFail($id);
        $item->update($request->only(['name', 'location', 'equipment_notes', 'status', 'notes']));

        return $this->sendResponse($item, Response::HTTP_OK, 'Theatre updated successfully.');
    }

    /**
     * Delete an operating theatre.
     */
    public function destroyTheatre(Request $request, $id)
    {
        $item = OperatingTheatre::findOrFail($id);

        $hasSurgeries = Surgery::where('theatre_id', $id)->exists();
        if ($hasSurgeries) {
            return $this->sendError('This theatre has surgeries and cannot be deleted.', Response::HTTP_CONFLICT);
        }

        $item->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Theatre deleted successfully.');
    }

    /**
     * List surgeries.
     */
    public function surgeries(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Scheduled,Ready,In-Progress,Completed,Postponed,Cancelled',
            'procedure_type' => 'sometimes|in:Elective,Emergency,Urgent',
            'date' => 'sometimes|date',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = Surgery::with(['patient', 'theatre', 'surgeon', 'anesthesiologist'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->procedure_type, fn ($q, $t) => $q->where('procedure_type', $t))
            ->when($request->date, function ($q, $d) {
                $q->whereDate('scheduled_at', $d)
                    ->orWhereDate('started_at', $d)
                    ->orWhereDate('ended_at', $d);
            })
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('surgery_no', 'like', "%{$search}%")
                        ->orWhere('procedure_name', 'like', "%{$search}%")
                        ->orWhere('pre_op_diagnosis', 'like', "%{$search}%")
                        ->orWhereHas('patient', function ($p) use ($search) {
                            $p->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByRaw("FIELD(status, 'In-Progress', 'Ready', 'Scheduled') ASC, scheduled_at ASC")
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Surgeries retrieved successfully.');
    }

    /**
     * Show a single surgery.
     */
    public function show(Request $request, $id)
    {
        $item = Surgery::with([
            'patient',
            'theatre',
            'admission.bed',
            'admission.ward',
            'surgeon',
            'assistantSurgeon',
            'anesthesiologist',
            'scrubNurse',
            'creator',
            'notes.author',
        ])->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'Surgery retrieved successfully.');
    }

    /**
     * Create a new surgery.
     */
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'theatre_id' => 'nullable|exists:operating_theatres,id',
            'admission_id' => 'nullable|exists:admissions,id',
            'surgeon_id' => 'nullable|exists:users,id',
            'assistant_surgeon_id' => 'nullable|exists:users,id',
            'anesthesiologist_id' => 'nullable|exists:users,id',
            'scrub_nurse_id' => 'nullable|exists:users,id',
            'procedure_name' => 'required|string|max:255',
            'procedure_type' => 'nullable|in:Elective,Emergency,Urgent',
            'scheduled_at' => 'nullable|date',
            'pre_op_diagnosis' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $surgeryNo = 'SU-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $item = Surgery::create([
            'surgery_no' => $surgeryNo,
            'clinic_id' => $user->clinic_id,
            'patient_id' => $request->patient_id,
            'theatre_id' => $request->theatre_id,
            'admission_id' => $request->admission_id,
            'surgeon_id' => $request->surgeon_id,
            'assistant_surgeon_id' => $request->assistant_surgeon_id,
            'anesthesiologist_id' => $request->anesthesiologist_id,
            'scrub_nurse_id' => $request->scrub_nurse_id,
            'procedure_name' => $request->procedure_name,
            'procedure_type' => $request->procedure_type ?? 'Elective',
            'scheduled_at' => $request->scheduled_at ? \Carbon\Carbon::parse($request->scheduled_at) : null,
            'pre_op_diagnosis' => $request->pre_op_diagnosis,
            'status' => 'Scheduled',
            'created_by' => $user->id,
            'notes' => $request->notes,
        ]);

        return $this->sendResponse(
            $item->load(['patient', 'theatre', 'surgeon', 'anesthesiologist']),
            Response::HTTP_CREATED,
            'Surgery created successfully.'
        );
    }

    /**
     * Update surgery details (scheduling / pre-op).
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'theatre_id' => 'nullable|exists:operating_theatres,id',
            'admission_id' => 'nullable|exists:admissions,id',
            'surgeon_id' => 'nullable|exists:users,id',
            'assistant_surgeon_id' => 'nullable|exists:users,id',
            'anesthesiologist_id' => 'nullable|exists:users,id',
            'scrub_nurse_id' => 'nullable|exists:users,id',
            'procedure_name' => 'sometimes|string|max:255',
            'procedure_type' => 'nullable|in:Elective,Emergency,Urgent',
            'scheduled_at' => 'nullable|date',
            'pre_op_diagnosis' => 'nullable|string|max:255',
            'status' => 'nullable|in:Scheduled,Ready,In-Progress,Completed,Postponed,Cancelled',
            'cancel_reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $item = Surgery::findOrFail($id);

        $data = $request->only([
            'theatre_id', 'admission_id', 'surgeon_id', 'assistant_surgeon_id',
            'anesthesiologist_id', 'scrub_nurse_id', 'procedure_name', 'procedure_type',
            'pre_op_diagnosis', 'status', 'cancel_reason', 'notes',
        ]);

        if ($request->has('scheduled_at')) {
            $data['scheduled_at'] = $request->scheduled_at ? \Carbon\Carbon::parse($request->scheduled_at) : $item->scheduled_at;
        }

        $item->update($data);

        return $this->sendResponse($item, Response::HTTP_OK, 'Surgery updated successfully.');
    }

    /**
     * Mark a surgery as ready for theatre.
     */
    public function markReady(Request $request, $id)
    {
        $item = Surgery::findOrFail($id);

        if ($item->status !== 'Scheduled') {
            return $this->sendError('Only scheduled surgeries can be marked ready.', Response::HTTP_CONFLICT);
        }

        $item->update(['status' => 'Ready']);

        return $this->sendResponse($item, Response::HTTP_OK, 'Surgery marked as ready.');
    }

    /**
     * Start a surgery.
     */
    public function startSurgery(Request $request, $id)
    {
        $user = $request->user();
        $item = Surgery::findOrFail($id);

        if (!in_array($item->status, ['Scheduled', 'Ready'])) {
            return $this->sendError('Only scheduled or ready surgeries can start.', Response::HTTP_CONFLICT);
        }

        $item->update([
            'status' => 'In-Progress',
            'started_at' => now(),
        ]);

        return $this->sendResponse($item, Response::HTTP_OK, 'Surgery started successfully.');
    }

    /**
     * Complete a surgery with intra/post-op details.
     */
    public function completeSurgery(Request $request, $id)
    {
        $request->validate([
            'post_op_diagnosis' => 'nullable|string|max:255',
            'intra_op_notes' => 'nullable|string',
            'post_op_notes' => 'nullable|string',
            'blood_loss_ml' => 'nullable|string|max:50',
            'complications' => 'nullable|string',
            'outcome' => 'nullable|string',
        ]);

        $item = Surgery::findOrFail($id);

        if ($item->status !== 'In-Progress') {
            return $this->sendError('Only in-progress surgeries can be completed.', Response::HTTP_CONFLICT);
        }

        $ended = now();
        $duration = $item->started_at ? $ended->diffInMinutes($item->started_at) : null;

        $item->update([
            'status' => 'Completed',
            'ended_at' => $ended,
            'duration_minutes' => $duration,
            'post_op_diagnosis' => $request->post_op_diagnosis,
            'intra_op_notes' => $request->intra_op_notes,
            'post_op_notes' => $request->post_op_notes,
            'blood_loss_ml' => $request->blood_loss_ml,
            'complications' => $request->complications,
            'outcome' => $request->outcome,
        ]);

        return $this->sendResponse($item, Response::HTTP_OK, 'Surgery completed successfully.');
    }

    /**
     * Cancel a surgery.
     */
    public function cancelSurgery(Request $request, $id)
    {
        $request->validate([
            'cancel_reason' => 'nullable|string|max:255',
        ]);

        $item = Surgery::findOrFail($id);

        if (in_array($item->status, ['Completed', 'Cancelled'])) {
            return $this->sendError('This surgery cannot be cancelled.', Response::HTTP_CONFLICT);
        }

        $item->update([
            'status' => 'Cancelled',
            'cancel_reason' => $request->cancel_reason,
        ]);

        return $this->sendResponse($item, Response::HTTP_OK, 'Surgery cancelled successfully.');
    }

    /**
     * Add a surgical note.
     */
    public function storeNote(Request $request, $id)
    {
        $request->validate([
            'note_type' => 'required|in:Pre-op,Intra-op,Post-op,Other',
            'note' => 'required|string',
        ]);

        $user = $request->user();
        $surgery = Surgery::findOrFail($id);

        $note = SurgicalNote::create([
            'clinic_id' => $user->clinic_id,
            'surgery_id' => $surgery->id,
            'author_id' => $user->id,
            'note_type' => $request->note_type,
            'note' => $request->note,
        ]);

        return $this->sendResponse(
            $note->load('author'),
            Response::HTTP_CREATED,
            'Surgical note added successfully.'
        );
    }

    /**
     * Delete a surgical note.
     */
    public function destroyNote(Request $request, $id)
    {
        $note = SurgicalNote::findOrFail($id);
        $note->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Surgical note deleted successfully.');
    }

    /**
     * Get a patient's surgical history.
     */
    public function patientHistory(Request $request, $patientId)
    {
        $items = Surgery::with(['theatre', 'surgeon'])
            ->where('patient_id', $patientId)
            ->orderByDesc('scheduled_at')
            ->get();

        return $this->sendResponse($items, Response::HTTP_OK, 'Surgical history retrieved successfully.');
    }

    /**
     * List active staff by role (for surgery assignment without employee_management privilege).
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

    /**
     * List active admissions for theatre scheduling.
     */
    public function admissions(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = Admission::with(['patient', 'ward'])
            ->where('status', 'Admitted')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->orderByDesc('admission_date')
            ->limit(200)
            ->get();

        return $this->sendResponse($items, Response::HTTP_OK, 'Active admissions retrieved successfully.');
    }
}
