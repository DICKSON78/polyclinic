<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\LabRequest;
use App\Models\LabRequestTest;
use App\Models\LabTest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LaboratoryController extends Controller
{
    use ApiResponse;

    /**
     * Get the laboratory dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $today = Carbon::today();

        $pending = LabRequest::where('status', 'Pending')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $inProgress = LabRequest::where('status', 'In Progress')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $completedToday = LabRequest::where('status', 'Completed')
            ->whereDate('completed_at', $today)
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $urgent = LabRequest::whereIn('status', ['Pending', 'In Progress'])
            ->where('priority', 'Stat')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $totalTests = LabTest::where('status', 'Active')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        return $this->sendResponse([
            'pending_requests' => (int) $pending,
            'in_progress' => (int) $inProgress,
            'completed_today' => (int) $completedToday,
            'urgent_requests' => (int) $urgent,
            'active_tests' => (int) $totalTests,
            'date' => $today->toDateString(),
        ], Response::HTTP_OK, 'Laboratory dashboard retrieved successfully.');
    }

    /**
     * List lab tests (catalog).
     */
    public function tests(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();

        $items = LabTest::query()
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

        return $this->sendResponse($items, Response::HTTP_OK, 'Lab tests retrieved successfully.');
    }

    /**
     * Create a lab test (catalog entry).
     */
    public function storeTest(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:100',
            'specimen_type' => 'nullable|string|max:100',
            'preparation' => 'nullable|string',
            'unit' => 'nullable|string|max:50',
            'reference_range' => 'nullable|string|max:100',
            'price' => 'nullable|numeric|min:0',
            'turnaround_time' => 'nullable|integer|min:0',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $data = $request->only([
            'name', 'code', 'category', 'specimen_type', 'preparation',
            'unit', 'reference_range', 'price', 'turnaround_time', 'status',
        ]);

        $data['clinic_id'] = $request->user()->clinic_id;
        $data['status'] = $data['status'] ?? 'Active';

        $item = LabTest::create($data);

        return $this->sendResponse($item, Response::HTTP_CREATED, 'Lab test created successfully.');
    }

    /**
     * Update a lab test (catalog entry).
     */
    public function updateTest(Request $request, $id)
    {
        $item = LabTest::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:100',
            'specimen_type' => 'nullable|string|max:100',
            'preparation' => 'nullable|string',
            'unit' => 'nullable|string|max:50',
            'reference_range' => 'nullable|string|max:100',
            'price' => 'nullable|numeric|min:0',
            'turnaround_time' => 'nullable|integer|min:0',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $data = $request->only([
            'name', 'code', 'category', 'specimen_type', 'preparation',
            'unit', 'reference_range', 'price', 'turnaround_time', 'status',
        ]);

        $item->update($data);

        return $this->sendResponse($item, Response::HTTP_OK, 'Lab test updated successfully.');
    }

    /**
     * Delete a lab test (catalog entry).
     */
    public function destroyTest(Request $request, $id)
    {
        $item = LabTest::findOrFail($id);

        $used = LabRequestTest::where('lab_test_id', $id)->count();
        if ($used > 0) {
            return $this->sendError('Cannot delete this lab test because it is referenced by existing lab requests.', Response::HTTP_CONFLICT);
        }

        $item->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Lab test deleted successfully.');
    }

    /**
     * List lab requests.
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

        $items = LabRequest::with(['patient', 'requestedBy', 'tests'])
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

        return $this->sendResponse($items, Response::HTTP_OK, 'Lab requests retrieved successfully.');
    }

    /**
     * Get a single lab request.
     */
    public function showRequest(Request $request, $id)
    {
        $item = LabRequest::with(['patient', 'requestedBy', 'sampleCollectedBy', 'completedBy', 'tests.labTest', 'tests.resultEnteredBy'])->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'Lab request retrieved successfully.');
    }

    /**
     * Create a new lab request.
     */
    public function storeRequest(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'priority' => 'nullable|in:Routine,Urgent,Stat',
            'clinical_notes' => 'nullable|string',
            'tests' => 'required|array|min:1',
            'tests.*.lab_test_id' => 'required|exists:lab_tests,id',
        ]);

        $user = $request->user();

        $requestNo = 'LR-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $item = LabRequest::create([
            'request_no' => $requestNo,
            'clinic_id' => $user->clinic_id,
            'patient_id' => $request->patient_id,
            'consultation_id' => $request->consultation_id,
            'requested_by' => $user->id,
            'priority' => $request->priority ?? 'Routine',
            'status' => 'Pending',
            'clinical_notes' => $request->clinical_notes,
        ]);

        foreach ($request->tests as $test) {
            $labTest = LabTest::findOrFail($test['lab_test_id']);
            LabRequestTest::create([
                'lab_request_id' => $item->id,
                'lab_test_id' => $labTest->id,
                'unit' => $labTest->unit,
                'reference_range' => $labTest->reference_range,
                'status' => 'Pending',
            ]);
        }

        return $this->sendResponse($item->load(['patient', 'tests.labTest']), Response::HTTP_CREATED, 'Lab request created successfully.');
    }

    /**
     * Mark a lab request as sample collected.
     */
    public function collectSample(Request $request, $id)
    {
        $item = LabRequest::with('tests')->findOrFail($id);

        if ($item->status === 'Completed') {
            return $this->sendError('Cannot collect samples for a completed lab request.', Response::HTTP_CONFLICT);
        }

        $item->status = 'In Progress';
        $item->sample_collected_at = now();
        $item->sample_collected_by = $request->user()->id;
        $item->save();

        $item->tests()->update(['status' => 'Collected']);

        return $this->sendResponse($item->load(['tests']), Response::HTTP_OK, 'Samples collected successfully.');
    }

    /**
     * Enter results for one or more tests on a lab request.
     */
    public function enterResults(Request $request, $id)
    {
        $item = LabRequest::with('tests')->findOrFail($id);

        $request->validate([
            'results' => 'required|array|min:1',
            'results.*.id' => 'required|exists:lab_request_tests,id',
            'results.*.result' => 'nullable|string|max:255',
            'results.*.is_abnormal' => 'nullable|boolean',
            'results.*.interpretation' => 'nullable|string',
        ]);

        $user = $request->user();

        DB::transaction(function () use ($request, $item, $user) {
            foreach ($request->results as $result) {
                $test = $item->tests()->findOrFail($result['id']);

                $test->result = $result['result'] ?? null;
                $test->is_abnormal = $result['is_abnormal'] ?? false;
                $test->interpretation = $result['interpretation'] ?? null;
                $test->result_entered_at = now();
                $test->result_entered_by = $user->id;
                $test->status = 'Completed';
                $test->save();
            }

            $pendingTests = $item->tests()->whereIn('status', ['Pending', 'Collected'])->count();

            if ($pendingTests === 0) {
                $item->status = 'Completed';
                $item->completed_at = now();
                $item->completed_by = $user->id;
                $item->save();
            } else {
                $item->status = 'In Progress';
                $item->save();
            }
        });

        return $this->sendResponse($item->load(['tests', 'tests.labTest']), Response::HTTP_OK, 'Lab results saved successfully.');
    }

    /**
     * Cancel a lab request.
     */
    public function cancelRequest(Request $request, $id)
    {
        $request->validate([
            'cancel_reason' => 'required|string|max:500',
        ]);

        $item = LabRequest::findOrFail($id);

        if ($item->status === 'Completed') {
            return $this->sendError('Cannot cancel a completed lab request.', Response::HTTP_CONFLICT);
        }

        $item->status = 'Cancelled';
        $item->cancel_reason = $request->cancel_reason;
        $item->save();

        $item->tests()->update(['status' => 'Pending']);

        return $this->sendResponse($item, Response::HTTP_OK, 'Lab request cancelled successfully.');
    }

    /**
     * Get lab request history for a patient.
     */
    public function patientHistory(Request $request, $patientId)
    {
        $items = LabRequest::with(['requestedBy', 'completedBy', 'tests.labTest', 'tests.resultEnteredBy'])
            ->where('patient_id', $patientId)
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 20));

        return $this->sendResponse($items, Response::HTTP_OK, 'Lab request history retrieved successfully.');
    }
}
