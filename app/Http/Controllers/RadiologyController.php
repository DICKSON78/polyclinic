<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\RadiologyExam;
use App\Models\RadiologyRequest;
use App\Models\RadiologyRequestExam;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class RadiologyController extends Controller
{
    use ApiResponse;

    /**
     * Get the radiology dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $today = Carbon::today();

        $pending = RadiologyRequest::where('status', 'Pending')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $inProgress = RadiologyRequest::where('status', 'In Progress')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $completedToday = RadiologyRequest::where('status', 'Completed')
            ->whereDate('completed_at', $today)
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $urgent = RadiologyRequest::whereIn('status', ['Pending', 'In Progress'])
            ->where('priority', 'Stat')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $activeExams = RadiologyExam::where('status', 'Active')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        return $this->sendResponse([
            'pending_requests' => (int) $pending,
            'in_progress' => (int) $inProgress,
            'completed_today' => (int) $completedToday,
            'urgent_requests' => (int) $urgent,
            'active_exams' => (int) $activeExams,
            'date' => $today->toDateString(),
        ], Response::HTTP_OK, 'Radiology dashboard retrieved successfully.');
    }

    /**
     * List radiology exams (catalog).
     */
    public function exams(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();

        $items = RadiologyExam::query()
            ->when($user->clinic_id, fn ($q) => $q->where('clinic_id', $user->clinic_id))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Radiology exams retrieved successfully.');
    }

    /**
     * Create a radiology exam (catalog entry).
     */
    public function storeExam(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:100',
            'preparation' => 'nullable|string',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'turnaround_time' => 'nullable|integer|min:0',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $data = $request->only([
            'name', 'code', 'category', 'preparation', 'description',
            'price', 'turnaround_time', 'status',
        ]);

        $data['clinic_id'] = $request->user()->clinic_id;
        $data['status'] = $data['status'] ?? 'Active';

        $item = RadiologyExam::create($data);

        return $this->sendResponse($item, Response::HTTP_CREATED, 'Radiology exam created successfully.');
    }

    /**
     * Update a radiology exam (catalog entry).
     */
    public function updateExam(Request $request, $id)
    {
        $item = RadiologyExam::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:100',
            'preparation' => 'nullable|string',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'turnaround_time' => 'nullable|integer|min:0',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $data = $request->only([
            'name', 'code', 'category', 'preparation', 'description',
            'price', 'turnaround_time', 'status',
        ]);

        $item->update($data);

        return $this->sendResponse($item, Response::HTTP_OK, 'Radiology exam updated successfully.');
    }

    /**
     * Delete a radiology exam (catalog entry).
     */
    public function destroyExam(Request $request, $id)
    {
        $item = RadiologyExam::findOrFail($id);

        $used = RadiologyRequestExam::where('radiology_exam_id', $id)->count();
        if ($used > 0) {
            return $this->sendError('Cannot delete this exam because it is referenced by existing radiology requests.', Response::HTTP_CONFLICT);
        }

        $item->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Radiology exam deleted successfully.');
    }

    /**
     * List radiology requests.
     */
    public function requests(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string',
            'priority' => 'sometimes|string',
            'q' => 'sometimes|string|max:100',
            'date' => 'sometimes|date',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = RadiologyRequest::with(['patient', 'requestedBy', 'exams'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->priority, fn ($q, $priority) => $q->where('priority', $priority))
            ->when($request->date, fn ($q, $date) => $q->whereDate('created_at', $date))
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('request_no', 'like', "%{$search}%")
                        ->orWhereHas('patient', function ($patient) use ($search) {
                            $patient->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('created_at')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Radiology requests retrieved successfully.');
    }

    /**
     * Get a single radiology request.
     */
    public function showRequest(Request $request, $id)
    {
        $item = RadiologyRequest::with(['patient', 'requestedBy', 'performedBy', 'completedBy', 'exams.radiologyExam', 'exams.resultEnteredBy'])->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'Radiology request retrieved successfully.');
    }

    /**
     * Create a new radiology request.
     */
    public function storeRequest(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'priority' => 'nullable|in:Routine,Urgent,Stat',
            'clinical_notes' => 'nullable|string',
            'contrast' => 'nullable|string|max:50',
            'exams' => 'required|array|min:1',
            'exams.*.radiology_exam_id' => 'required|exists:radiology_exams,id',
        ]);

        $user = $request->user();

        $requestNo = 'RX-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $item = RadiologyRequest::create([
            'request_no' => $requestNo,
            'clinic_id' => $user->clinic_id,
            'patient_id' => $request->patient_id,
            'consultation_id' => $request->consultation_id,
            'requested_by' => $user->id,
            'priority' => $request->priority ?? 'Routine',
            'status' => 'Pending',
            'clinical_notes' => $request->clinical_notes,
            'contrast' => $request->contrast,
        ]);

        foreach ($request->exams as $exam) {
            RadiologyRequestExam::create([
                'radiology_request_id' => $item->id,
                'radiology_exam_id' => $exam['radiology_exam_id'],
                'status' => 'Pending',
            ]);
        }

        return $this->sendResponse($item->load(['patient', 'exams.radiologyExam']), Response::HTTP_CREATED, 'Radiology request created successfully.');
    }

    /**
     * Mark a radiology request as performed.
     */
    public function markPerformed(Request $request, $id)
    {
        $item = RadiologyRequest::with('exams')->findOrFail($id);

        if ($item->status === 'Completed') {
            return $this->sendError('Cannot mark a completed radiology request as performed.', Response::HTTP_CONFLICT);
        }

        $item->status = 'In Progress';
        $item->performed_at = now();
        $item->performed_by = $request->user()->id;
        $item->save();

        $item->exams()->update(['status' => 'Performed']);

        return $this->sendResponse($item->load(['exams']), Response::HTTP_OK, 'Exams marked as performed successfully.');
    }

    /**
     * Enter results for one or more exams on a radiology request.
     */
    public function enterResults(Request $request, $id)
    {
        $item = RadiologyRequest::with('exams')->findOrFail($id);

        $request->validate([
            'results' => 'required|array|min:1',
            'results.*.id' => 'required|exists:radiology_request_exams,id',
            'results.*.findings' => 'nullable|string',
            'results.*.impression' => 'nullable|string',
            'results.*.conclusion' => 'nullable|string',
        ]);

        $user = $request->user();

        DB::transaction(function () use ($request, $item, $user) {
            foreach ($request->results as $result) {
                $exam = $item->exams()->findOrFail($result['id']);

                $exam->findings = $result['findings'] ?? null;
                $exam->impression = $result['impression'] ?? null;
                $exam->conclusion = $result['conclusion'] ?? null;
                $exam->result_entered_at = now();
                $exam->result_entered_by = $user->id;
                $exam->status = 'Completed';
                $exam->save();
            }

            $pendingExams = $item->exams()->whereIn('status', ['Pending', 'Performed'])->count();

            if ($pendingExams === 0) {
                $item->status = 'Completed';
                $item->completed_at = now();
                $item->completed_by = $user->id;
                $item->save();
            } else {
                $item->status = 'In Progress';
                $item->save();
            }
        });

        return $this->sendResponse($item->load(['exams', 'exams.radiologyExam']), Response::HTTP_OK, 'Radiology results saved successfully.');
    }

    /**
     * Cancel a radiology request.
     */
    public function cancelRequest(Request $request, $id)
    {
        $request->validate([
            'cancel_reason' => 'required|string|max:500',
        ]);

        $item = RadiologyRequest::findOrFail($id);

        if ($item->status === 'Completed') {
            return $this->sendError('Cannot cancel a completed radiology request.', Response::HTTP_CONFLICT);
        }

        $item->status = 'Cancelled';
        $item->cancel_reason = $request->cancel_reason;
        $item->save();

        $item->exams()->update(['status' => 'Pending']);

        return $this->sendResponse($item, Response::HTTP_OK, 'Radiology request cancelled successfully.');
    }

    /**
     * Get radiology request history for a patient.
     */
    public function patientHistory(Request $request, $patientId)
    {
        $items = RadiologyRequest::with(['requestedBy', 'completedBy', 'exams.radiologyExam', 'exams.resultEnteredBy'])
            ->where('patient_id', $patientId)
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 20));

        return $this->sendResponse($items, Response::HTTP_OK, 'Radiology request history retrieved successfully.');
    }
}
