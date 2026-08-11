<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\AnesthesiaRecord;
use App\Models\AnesthesiaVital;
use App\Models\Surgery;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class AnesthesiaController extends Controller
{
    use ApiResponse;

    /**
     * Anesthesia dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $query = AnesthesiaRecord::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id));

        $today = now()->toDateString();

        $summary = [
            'in_progress' => (clone $query)->where('status', 'In-Progress')->count(),
            'completed_today' => (clone $query)->where('status', 'Completed')->whereDate('induction_time', $today)->count(),
            'completed_total' => (clone $query)->where('status', 'Completed')->count(),
            'total' => (clone $query)->count(),
            'surgeries_awaiting_anesthesia' => Surgery::query()
                ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
                ->whereIn('status', ['Scheduled', 'Ready'])
                ->count(),
            'date' => $today,
        ];

        return $this->sendResponse($summary, Response::HTTP_OK, 'Anesthesia dashboard retrieved successfully.');
    }

    /**
     * List anesthesia records.
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:In-Progress,Completed,Cancelled',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = AnesthesiaRecord::with(['patient', 'surgery', 'anesthesiologist'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('record_no', 'like', "%{$search}%")
                        ->orWhereHas('patient', function ($p) use ($search) {
                            $p->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        })
                        ->orWhereHas('surgery', function ($s) use ($search) {
                            $s->where('procedure_name', 'like', "%{$search}%")
                                ->orWhere('surgery_no', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByRaw("FIELD(status, 'In-Progress') ASC, induction_time DESC")
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Anesthesia records retrieved successfully.');
    }

    /**
     * Show a single anesthesia record.
     */
    public function show(Request $request, $id)
    {
        $item = AnesthesiaRecord::with([
            'patient',
            'surgery',
            'admission',
            'anesthesiologist',
            'creator',
            'vitals',
        ])->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'Anesthesia record retrieved successfully.');
    }

    /**
     * Create a new anesthesia record.
     */
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'surgery_id' => 'nullable|exists:surgeries,id',
            'admission_id' => 'nullable|exists:admissions,id',
            'anesthesiologist_id' => 'nullable|exists:users,id',
            'anesthesia_type' => 'nullable|in:General,Regional,Local,Sedation',
            'asa_class' => 'nullable|string|max:10',
            'pre_op_assessment' => 'nullable|string',
            'allergies' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $recordNo = 'AN-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $item = AnesthesiaRecord::create([
            'record_no' => $recordNo,
            'clinic_id' => $user->clinic_id,
            'patient_id' => $request->patient_id,
            'surgery_id' => $request->surgery_id,
            'admission_id' => $request->admission_id,
            'anesthesiologist_id' => $request->anesthesiologist_id,
            'anesthesia_type' => $request->anesthesia_type ?? 'General',
            'asa_class' => $request->asa_class,
            'pre_op_assessment' => $request->pre_op_assessment,
            'allergies' => $request->allergies,
            'status' => 'In-Progress',
            'created_by' => $user->id,
            'notes' => $request->notes,
        ]);

        return $this->sendResponse(
            $item->load(['patient', 'surgery', 'anesthesiologist']),
            Response::HTTP_CREATED,
            'Anesthesia record created successfully.'
        );
    }

    /**
     * Update an anesthesia record.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'anesthesiologist_id' => 'nullable|exists:users,id',
            'anesthesia_type' => 'nullable|in:General,Regional,Local,Sedation',
            'asa_class' => 'nullable|string|max:10',
            'airway' => 'nullable|string|max:50',
            'fasting_hours' => 'nullable|string|max:50',
            'pre_op_assessment' => 'nullable|string',
            'allergies' => 'nullable|string',
            'induction_agent' => 'nullable|string|max:255',
            'maintenance_agents' => 'nullable|string',
            'reversal_agents' => 'nullable|string',
            'iv_fluids_ml' => 'nullable|string|max:50',
            'blood_transfusion_ml' => 'nullable|string|max:50',
            'urine_output_ml' => 'nullable|string|max:50',
            'blood_loss_ml' => 'nullable|string|max:50',
            'intraop_complications' => 'nullable|string',
            'postop_complications' => 'nullable|string',
            'postop_instructions' => 'nullable|string',
            'status' => 'nullable|in:In-Progress,Completed,Cancelled',
            'notes' => 'nullable|string',
        ]);

        $item = AnesthesiaRecord::findOrFail($id);
        $item->update($request->only([
            'anesthesiologist_id', 'anesthesia_type', 'asa_class', 'airway', 'fasting_hours',
            'pre_op_assessment', 'allergies', 'induction_agent', 'maintenance_agents',
            'reversal_agents', 'iv_fluids_ml', 'blood_transfusion_ml', 'urine_output_ml',
            'blood_loss_ml', 'intraop_complications', 'postop_complications',
            'postop_instructions', 'status', 'notes',
        ]));

        return $this->sendResponse($item, Response::HTTP_OK, 'Anesthesia record updated successfully.');
    }

    /**
     * Start anesthesia (set induction time).
     */
    public function start(Request $request, $id)
    {
        $item = AnesthesiaRecord::findOrFail($id);

        if ($item->status !== 'In-Progress') {
            return $this->sendError('Only in-progress records can be started.', Response::HTTP_CONFLICT);
        }

        $item->update(['induction_time' => $item->induction_time ?? now()]);

        return $this->sendResponse($item, Response::HTTP_OK, 'Anesthesia induction recorded.');
    }

    /**
     * Complete an anesthesia record.
     */
    public function complete(Request $request, $id)
    {
        $item = AnesthesiaRecord::findOrFail($id);

        if ($item->status !== 'In-Progress') {
            return $this->sendError('Only in-progress records can be completed.', Response::HTTP_CONFLICT);
        }

        $item->update([
            'status' => 'Completed',
            'emergence_time' => $item->emergence_time ?? now(),
        ]);

        return $this->sendResponse($item, Response::HTTP_OK, 'Anesthesia record completed successfully.');
    }

    /**
     * Cancel an anesthesia record.
     */
    public function cancel(Request $request, $id)
    {
        $item = AnesthesiaRecord::findOrFail($id);

        if (in_array($item->status, ['Completed', 'Cancelled'])) {
            return $this->sendError('This record cannot be cancelled.', Response::HTTP_CONFLICT);
        }

        $item->update(['status' => 'Cancelled']);

        return $this->sendResponse($item, Response::HTTP_OK, 'Anesthesia record cancelled.');
    }

    /**
     * Add a vitals reading to an anesthesia record.
     */
    public function storeVital(Request $request, $id)
    {
        $request->validate([
            'recorded_at' => 'nullable|date',
            'heart_rate' => 'nullable|string|max:20',
            'blood_pressure' => 'nullable|string|max:20',
            'oxygen_saturation' => 'nullable|string|max:20',
            'respiratory_rate' => 'nullable|string|max:20',
            'temperature' => 'nullable|string|max:20',
            'etco2' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $record = AnesthesiaRecord::findOrFail($id);

        $vital = AnesthesiaVital::create([
            'anesthesia_record_id' => $record->id,
            'recorded_at' => $request->recorded_at ? \Carbon\Carbon::parse($request->recorded_at) : now(),
            'heart_rate' => $request->heart_rate,
            'blood_pressure' => $request->blood_pressure,
            'oxygen_saturation' => $request->oxygen_saturation,
            'respiratory_rate' => $request->respiratory_rate,
            'temperature' => $request->temperature,
            'etco2' => $request->etco2,
            'notes' => $request->notes,
        ]);

        return $this->sendResponse($vital, Response::HTTP_CREATED, 'Vitals reading added successfully.');
    }

    /**
     * Delete a vitals reading.
     */
    public function destroyVital(Request $request, $id)
    {
        $vital = AnesthesiaVital::findOrFail($id);
        $vital->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Vitals reading deleted successfully.');
    }

    /**
     * Get a patient's anesthesia history.
     */
    public function patientHistory(Request $request, $patientId)
    {
        $items = AnesthesiaRecord::with(['surgery', 'anesthesiologist'])
            ->where('patient_id', $patientId)
            ->orderByDesc('induction_time')
            ->get();

        return $this->sendResponse($items, Response::HTTP_OK, 'Anesthesia history retrieved successfully.');
    }

    /**
     * List staff by role.
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
