<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Admission;
use App\Models\DischargeSummary;
use App\Models\FluidBalance;
use App\Models\MarEntry;
use App\Models\NursingChart;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WardRecordsController extends Controller
{
    use ApiResponse;

    /**
     * Ward clinical records dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $activeAdmissionIds = Admission::where('status', 'Admitted')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->pluck('id');

        $today = now()->toDateString();

        $summary = [
            'active_admissions' => $activeAdmissionIds->count(),
            'draft_summaries' => DischargeSummary::where('status', 'Draft')
                ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
                ->count(),
            'finalized_summaries' => DischargeSummary::where('status', 'Finalized')
                ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
                ->count(),
            'charts_today' => NursingChart::whereDate('chart_date', $today)
                ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
                ->count(),
            'fluid_entries_today' => FluidBalance::whereDate('balance_date', $today)
                ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
                ->count(),
            'mar_due_today' => MarEntry::whereDate('scheduled_time', $today)
                ->where('status', 'Scheduled')
                ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
                ->count(),
            'mar_given_today' => MarEntry::whereDate('scheduled_time', $today)
                ->where('status', 'Given')
                ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
                ->count(),
            'missing_charts' => $activeAdmissionIds->isEmpty() ? 0 : NursingChart::whereDate('chart_date', $today)
                ->whereIn('admission_id', $activeAdmissionIds)
                ->distinct('admission_id')
                ->count('admission_id'),
            'missing_mar' => MarEntry::whereDate('scheduled_time', $today)
                ->where('status', 'Scheduled')
                ->whereNull('given_at')
                ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
                ->count(),
        ];

        return $this->sendResponse($summary, Response::HTTP_OK, 'Ward records dashboard retrieved successfully.');
    }

    /**
     * List discharge summaries.
     */
    public function dischargeSummaries(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Draft,Finalized',
            'admission_id' => 'sometimes|exists:admissions,id',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = DischargeSummary::with(['admission.ward', 'patient', 'doctor'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->admission_id, fn ($q, $s) => $q->where('admission_id', $s))
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('diagnoses', 'like', "%{$search}%")
                        ->orWhereHas('patient', function ($p) use ($search) {
                            $p->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('created_at')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Discharge summaries retrieved successfully.');
    }

    /**
     * Show a single discharge summary.
     */
    public function showDischargeSummary(Request $request, $id)
    {
        $item = DischargeSummary::with(['admission.ward', 'admission.bed', 'patient', 'doctor'])
            ->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'Discharge summary retrieved successfully.');
    }

    /**
     * Store / update a discharge summary for an admission.
     */
    public function storeDischargeSummary(Request $request)
    {
        $request->validate([
            'admission_id' => 'required|exists:admissions,id',
            'admission_reason' => 'nullable|string',
            'diagnoses' => 'nullable|string',
            'procedures' => 'nullable|string',
            'medications' => 'nullable|string',
            'follow_up_instructions' => 'nullable|string',
            'discharge_condition' => 'nullable|in:Stable,Improved,Recovered,Unchanged,Worsened',
            'summary' => 'nullable|string',
            'doctor_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $admission = Admission::findOrFail($request->admission_id);
        $user = $request->user();

        $item = DischargeSummary::updateOrCreate(
            ['admission_id' => $admission->id],
            [
                'clinic_id' => $admission->clinic_id ?? $user->clinic_id,
                'patient_id' => $admission->patient_id,
                'admission_reason' => $request->admission_reason,
                'diagnoses' => $request->diagnoses,
                'procedures' => $request->procedures,
                'medications' => $request->medications,
                'follow_up_instructions' => $request->follow_up_instructions,
                'discharge_condition' => $request->discharge_condition,
                'summary' => $request->summary,
                'doctor_id' => $request->doctor_id,
                'prepared_at' => now(),
                'notes' => $request->notes,
            ]
        );

        return $this->sendResponse(
            $item->load(['admission.ward', 'patient', 'doctor']),
            Response::HTTP_OK,
            'Discharge summary saved successfully.'
        );
    }

    /**
     * Finalize a discharge summary.
     */
    public function finalizeDischargeSummary(Request $request, $id)
    {
        $item = DischargeSummary::findOrFail($id);

        if ($item->status === 'Finalized') {
            return $this->sendError('This summary is already finalized.', Response::HTTP_CONFLICT);
        }

        $item->update(['status' => 'Finalized']);

        return $this->sendResponse(
            $item->load(['admission.ward', 'patient', 'doctor']),
            Response::HTTP_OK,
            'Discharge summary finalized successfully.'
        );
    }

    /**
     * List nursing charts.
     */
    public function nursingCharts(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'admission_id' => 'sometimes|exists:admissions,id',
            'patient_id' => 'sometimes|exists:patients,id',
            'from' => 'sometimes|date',
            'to' => 'sometimes|date',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = NursingChart::with(['admission.ward', 'patient', 'recordedBy'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->admission_id, fn ($q, $s) => $q->where('admission_id', $s))
            ->when($request->patient_id, fn ($q, $s) => $q->where('patient_id', $s))
            ->when($request->from, fn ($q, $d) => $q->whereDate('chart_date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('chart_date', '<=', $d))
            ->orderByDesc('chart_date')
            ->orderByDesc('recorded_at')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Nursing charts retrieved successfully.');
    }

    /**
     * Store a nursing chart entry.
     */
    public function storeNursingChart(Request $request)
    {
        $request->validate([
            'admission_id' => 'required|exists:admissions,id',
            'chart_date' => 'required|date',
            'shift' => 'nullable|in:Morning,Evening,Night',
            'temperature' => 'nullable|numeric',
            'pulse' => 'nullable|numeric',
            'respiration' => 'nullable|numeric',
            'blood_pressure' => 'nullable|string|max:20',
            'spo2' => 'nullable|numeric',
            'blood_sugar' => 'nullable|numeric',
            'pain_level' => 'nullable|integer|min:0|max:10',
            'nursing_notes' => 'nullable|string',
            'observations' => 'nullable|string',
        ]);

        $admission = Admission::findOrFail($request->admission_id);
        $user = $request->user();

        $item = NursingChart::create([
            'clinic_id' => $admission->clinic_id ?? $user->clinic_id,
            'admission_id' => $admission->id,
            'patient_id' => $admission->patient_id,
            'chart_date' => Carbon::parse($request->chart_date),
            'shift' => $request->shift,
            'temperature' => $request->temperature,
            'pulse' => $request->pulse,
            'respiration' => $request->respiration,
            'blood_pressure' => $request->blood_pressure,
            'spo2' => $request->spo2,
            'blood_sugar' => $request->blood_sugar,
            'pain_level' => $request->pain_level,
            'nursing_notes' => $request->nursing_notes,
            'observations' => $request->observations,
            'recorded_by' => $user->id,
            'recorded_at' => now(),
        ]);

        return $this->sendResponse(
            $item->load(['admission.ward', 'patient', 'recordedBy']),
            Response::HTTP_CREATED,
            'Nursing chart saved successfully.'
        );
    }

    /**
     * Delete a nursing chart entry.
     */
    public function destroyNursingChart(Request $request, $id)
    {
        $item = NursingChart::findOrFail($id);
        $item->delete();

        return $this->sendResponse($item, Response::HTTP_OK, 'Nursing chart entry deleted successfully.');
    }

    /**
     * List fluid balance entries.
     */
    public function fluidBalances(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'admission_id' => 'sometimes|exists:admissions,id',
            'patient_id' => 'sometimes|exists:patients,id',
            'from' => 'sometimes|date',
            'to' => 'sometimes|date',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = FluidBalance::with(['admission.ward', 'patient', 'recordedBy'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->admission_id, fn ($q, $s) => $q->where('admission_id', $s))
            ->when($request->patient_id, fn ($q, $s) => $q->where('patient_id', $s))
            ->when($request->from, fn ($q, $d) => $q->whereDate('balance_date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('balance_date', '<=', $d))
            ->orderByDesc('balance_date')
            ->orderByDesc('id')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Fluid balance entries retrieved successfully.');
    }

    /**
     * Store a fluid balance entry.
     */
    public function storeFluidBalance(Request $request)
    {
        $request->validate([
            'admission_id' => 'required|exists:admissions,id',
            'balance_date' => 'required|date',
            'shift' => 'nullable|in:Morning,Evening,Night',
            'intake_oral' => 'nullable|numeric|min:0',
            'intake_iv' => 'nullable|numeric|min:0',
            'intake_other' => 'nullable|numeric|min:0',
            'output_urine' => 'nullable|numeric|min:0',
            'output_drain' => 'nullable|numeric|min:0',
            'output_other' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $admission = Admission::findOrFail($request->admission_id);
        $user = $request->user();

        $item = FluidBalance::create([
            'clinic_id' => $admission->clinic_id ?? $user->clinic_id,
            'admission_id' => $admission->id,
            'patient_id' => $admission->patient_id,
            'balance_date' => Carbon::parse($request->balance_date),
            'shift' => $request->shift,
            'intake_oral' => $request->intake_oral ?? 0,
            'intake_iv' => $request->intake_iv ?? 0,
            'intake_other' => $request->intake_other ?? 0,
            'output_urine' => $request->output_urine ?? 0,
            'output_drain' => $request->output_drain ?? 0,
            'output_other' => $request->output_other ?? 0,
            'recorded_by' => $user->id,
            'notes' => $request->notes,
        ]);

        return $this->sendResponse(
            $item->load(['admission.ward', 'patient', 'recordedBy']),
            Response::HTTP_CREATED,
            'Fluid balance saved successfully.'
        );
    }

    /**
     * Delete a fluid balance entry.
     */
    public function destroyFluidBalance(Request $request, $id)
    {
        $item = FluidBalance::findOrFail($id);
        $item->delete();

        return $this->sendResponse($item, Response::HTTP_OK, 'Fluid balance entry deleted successfully.');
    }

    /**
     * List MAR entries.
     */
    public function mar(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'admission_id' => 'sometimes|exists:admissions,id',
            'patient_id' => 'sometimes|exists:patients,id',
            'status' => 'sometimes|in:Scheduled,Given,Refused,Withheld',
            'date' => 'sometimes|date',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = MarEntry::with(['admission.ward', 'patient', 'givenBy'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->admission_id, fn ($q, $s) => $q->where('admission_id', $s))
            ->when($request->patient_id, fn ($q, $s) => $q->where('patient_id', $s))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->date, fn ($q, $d) => $q->whereDate('scheduled_time', $d))
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('medication_name', 'like', "%{$search}%")
                        ->orWhere('dose', 'like', "%{$search}%")
                        ->orWhereHas('patient', function ($p) use ($search) {
                            $p->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('scheduled_time')
            ->orderByDesc('id')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Medication administration records retrieved successfully.');
    }

    /**
     * Store a MAR entry.
     */
    public function storeMar(Request $request)
    {
        $request->validate([
            'admission_id' => 'required|exists:admissions,id',
            'medication_name' => 'required|string|max:255',
            'dose' => 'nullable|string|max:100',
            'route' => 'nullable|in:Oral,IV,IM,SC,Topical,Inhalation,Other',
            'scheduled_time' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $admission = Admission::findOrFail($request->admission_id);
        $user = $request->user();

        $item = MarEntry::create([
            'clinic_id' => $admission->clinic_id ?? $user->clinic_id,
            'admission_id' => $admission->id,
            'patient_id' => $admission->patient_id,
            'medication_name' => $request->medication_name,
            'dose' => $request->dose,
            'route' => $request->route,
            'scheduled_time' => Carbon::parse($request->scheduled_time),
            'status' => 'Scheduled',
            'notes' => $request->notes,
        ]);

        return $this->sendResponse(
            $item->load(['admission.ward', 'patient', 'givenBy']),
            Response::HTTP_CREATED,
            'Medication scheduled successfully.'
        );
    }

    /**
     * Update MAR entry administration status.
     */
    public function updateMarStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Given,Refused,Withheld',
            'reason_omitted' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $item = MarEntry::findOrFail($id);

        $update = [
            'status' => $request->status,
            'reason_omitted' => $request->reason_omitted,
            'notes' => $request->notes ?? $item->notes,
        ];

        if ($request->status === 'Given') {
            $update['given_at'] = now();
            $update['given_by'] = $request->user()->id;
        }

        $item->update($update);

        return $this->sendResponse(
            $item->load(['admission.ward', 'patient', 'givenBy']),
            Response::HTTP_OK,
            'Medication record updated successfully.'
        );
    }

    /**
     * Delete a MAR entry.
     */
    public function destroyMar(Request $request, $id)
    {
        $item = MarEntry::findOrFail($id);
        $item->delete();

        return $this->sendResponse($item, Response::HTTP_OK, 'Medication record deleted successfully.');
    }

    /**
     * List staff for doctor/nurse selection.
     */
    public function staff(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = User::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->where('status', 'Active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'middle_name', 'last_name', 'role', 'phone']);

        return $this->sendResponse($items, Response::HTTP_OK, 'Staff retrieved successfully.');
    }
}
