<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\BloodBankUnit;
use App\Models\BloodDonor;
use App\Models\Transfusion;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class BloodBankController extends Controller
{
    use ApiResponse;

    /**
     * Blood bank dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $query = BloodBankUnit::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id));

        $summary = [
            'available' => (clone $query)->where('status', 'Available')->count(),
            'reserved' => (clone $query)->where('status', 'Reserved')->count(),
            'cross_matched' => (clone $query)->where('status', 'Cross-matched')->count(),
            'issued' => (clone $query)->where('status', 'Issued')->count(),
            'expiring_soon' => (clone $query)->where('status', 'Available')
                ->whereDate('expiry_date', '<=', now()->addDays(7))
                ->count(),
            'total_units' => (clone $query)->count(),
            'donors' => BloodDonor::query()
                ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
                ->where('status', 'Active')
                ->count(),
            'pending_transfusions' => Transfusion::query()
                ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
                ->whereIn('status', ['Requested', 'Cross-matching'])
                ->count(),
        ];

        return $this->sendResponse($summary, Response::HTTP_OK, 'Blood bank dashboard retrieved successfully.');
    }

    /**
     * List blood bank units.
     */
    public function units(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Available,Reserved,Cross-matched,Issued,Discarded,Expired',
            'blood_group' => 'sometimes|string|max:5',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = BloodBankUnit::with(['donor', 'patient'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->blood_group, fn ($q, $bg) => $q->where('blood_group', $bg))
            ->when($request->q, function ($q, $search) {
                $q->where('unit_no', 'like', "%{$search}%")
                    ->orWhere('blood_group', 'like', "%{$search}%")
                    ->orWhere('storage_location', 'like', "%{$search}%");
            })
            ->orderByRaw("FIELD(status, 'Available', 'Reserved', 'Cross-matched', 'Issued') ASC, expiry_date ASC")
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Blood units retrieved successfully.');
    }

    /**
     * Store a new blood unit.
     */
    public function storeUnit(Request $request)
    {
        $request->validate([
            'donor_id' => 'nullable|exists:blood_donors,id',
            'blood_group' => 'required|in:A,B,AB,O',
            'rh_factor' => 'nullable|in:Positive,Negative',
            'component_type' => 'nullable|string|max:100',
            'donation_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:donation_date',
            'volume_ml' => 'nullable|string|max:20',
            'storage_location' => 'nullable|string|max:100',
            'status' => 'nullable|in:Available,Reserved,Cross-matched,Issued,Discarded,Expired',
            'discard_reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $unitNo = 'BU-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $item = BloodBankUnit::create([
            'unit_no' => $unitNo,
            'clinic_id' => $user->clinic_id,
            'donor_id' => $request->donor_id,
            'blood_group' => $request->blood_group,
            'rh_factor' => $request->rh_factor ?? 'Positive',
            'component_type' => $request->component_type ?? 'Whole Blood',
            'donation_date' => $request->donation_date,
            'expiry_date' => $request->expiry_date,
            'volume_ml' => $request->volume_ml,
            'storage_location' => $request->storage_location,
            'status' => $request->status ?? 'Available',
            'discard_reason' => $request->discard_reason,
            'notes' => $request->notes,
        ]);

        return $this->sendResponse($item, Response::HTTP_CREATED, 'Blood unit added successfully.');
    }

    /**
     * Update a blood unit.
     */
    public function updateUnit(Request $request, $id)
    {
        $request->validate([
            'blood_group' => 'sometimes|in:A,B,AB,O',
            'rh_factor' => 'nullable|in:Positive,Negative',
            'component_type' => 'nullable|string|max:100',
            'donation_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:donation_date',
            'volume_ml' => 'nullable|string|max:20',
            'storage_location' => 'nullable|string|max:100',
            'status' => 'nullable|in:Available,Reserved,Cross-matched,Issued,Discarded,Expired',
            'discard_reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $item = BloodBankUnit::findOrFail($id);

        $data = $request->only([
            'blood_group', 'rh_factor', 'component_type', 'donation_date', 'expiry_date',
            'volume_ml', 'storage_location', 'status', 'discard_reason', 'notes',
        ]);

        if ($request->has('status') && in_array($request->status, ['Discarded', 'Expired']) && $request->status !== $item->status) {
            $data['discard_reason'] = $request->discard_reason ?? 'Marked ' . $request->status;
        }

        $item->update($data);

        return $this->sendResponse($item, Response::HTTP_OK, 'Blood unit updated successfully.');
    }

    /**
     * List blood donors.
     */
    public function donors(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = BloodDonor::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->q, function ($q, $search) {
                $q->where('donor_no', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('blood_group', 'like', "%{$search}%");
            })
            ->orderByDesc('created_at')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Blood donors retrieved successfully.');
    }

    /**
     * Store a new blood donor.
     */
    public function storeDonor(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:Male,Female',
            'blood_group' => 'nullable|in:A,B,AB,O',
            'rh_factor' => 'nullable|in:Positive,Negative',
            'national_id' => 'nullable|string|max:50',
            'occupation' => 'nullable|string|max:100',
            'medical_history' => 'nullable|string',
            'status' => 'nullable|in:Active,Deferred,Inactive',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $donorNo = 'BD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $item = BloodDonor::create([
            'donor_no' => $donorNo,
            'clinic_id' => $user->clinic_id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'phone' => $request->phone,
            'email' => $request->email,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'blood_group' => $request->blood_group,
            'rh_factor' => $request->rh_factor,
            'national_id' => $request->national_id,
            'occupation' => $request->occupation,
            'medical_history' => $request->medical_history,
            'status' => $request->status ?? 'Active',
            'notes' => $request->notes,
        ]);

        return $this->sendResponse($item, Response::HTTP_CREATED, 'Blood donor registered successfully.');
    }

    /**
     * Update a blood donor.
     */
    public function updateDonor(Request $request, $id)
    {
        $request->validate([
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:Male,Female',
            'blood_group' => 'nullable|in:A,B,AB,O',
            'rh_factor' => 'nullable|in:Positive,Negative',
            'national_id' => 'nullable|string|max:50',
            'occupation' => 'nullable|string|max:100',
            'medical_history' => 'nullable|string',
            'status' => 'nullable|in:Active,Deferred,Inactive',
            'notes' => 'nullable|string',
        ]);

        $item = BloodDonor::findOrFail($id);
        $item->update($request->only([
            'first_name', 'last_name', 'phone', 'email', 'date_of_birth', 'gender',
            'blood_group', 'rh_factor', 'national_id', 'occupation', 'medical_history',
            'status', 'notes',
        ]));

        return $this->sendResponse($item, Response::HTTP_OK, 'Blood donor updated successfully.');
    }

    /**
     * List transfusions.
     */
    public function transfusions(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Requested,Cross-matching,In-Progress,Completed,Cancelled',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = Transfusion::with(['patient', 'unit', 'requester'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->q, function ($q, $search) {
                $q->where('transfusion_no', 'like', "%{$search}%")
                    ->orWhere('indication', 'like', "%{$search}%")
                    ->orWhereHas('patient', function ($p) use ($search) {
                        $p->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            })
            ->orderByRaw("FIELD(status, 'Requested', 'Cross-matching', 'In-Progress') ASC, created_at DESC")
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Transfusions retrieved successfully.');
    }

    /**
     * Show a single transfusion.
     */
    public function showTransfusion(Request $request, $id)
    {
        $item = Transfusion::with(['patient', 'unit.donor', 'requester', 'administeredBy'])
            ->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'Transfusion retrieved successfully.');
    }

    /**
     * Request a transfusion.
     */
    public function storeTransfusion(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'unit_id' => 'required|exists:blood_bank_units,id',
            'indication' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $unit = BloodBankUnit::findOrFail($request->unit_id);

        if (!in_array($unit->status, ['Available', 'Reserved', 'Cross-matched'])) {
            return $this->sendError('The selected blood unit is not available for transfusion.', Response::HTTP_CONFLICT);
        }

        $transfusionNo = 'TF-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $result = DB::transaction(function () use ($request, $user, $unit, $transfusionNo) {
            $item = Transfusion::create([
                'transfusion_no' => $transfusionNo,
                'clinic_id' => $user->clinic_id,
                'patient_id' => $request->patient_id,
                'unit_id' => $unit->id,
                'requested_by' => $user->id,
                'indication' => $request->indication,
                'status' => 'Requested',
                'notes' => $request->notes,
            ]);

            $unit->status = 'Reserved';
            $unit->patient_id = $request->patient_id;
            $unit->reserved_at = now();
            $unit->save();

            return $item;
        });

        return $this->sendResponse(
            $result->load(['patient', 'unit', 'requester']),
            Response::HTTP_CREATED,
            'Transfusion requested successfully.'
        );
    }

    /**
     * Record cross-match result.
     */
    public function crossMatch(Request $request, $id)
    {
        $request->validate([
            'result' => 'required|in:Compatible,Incompatible',
            'notes' => 'nullable|string',
        ]);

        $item = Transfusion::findOrFail($id);

        if (!in_array($item->status, ['Requested', 'Cross-matching'])) {
            return $this->sendError('Cross-match is not pending for this transfusion.', Response::HTTP_CONFLICT);
        }

        if ($request->result === 'Incompatible') {
            $item->update([
                'status' => 'Cancelled',
                'cross_match' => 'Incompatible',
                'cross_match_time' => now(),
                'reaction_notes' => 'Incompatible cross-match',
            ]);
            $item->unit?->update(['status' => 'Available', 'patient_id' => null, 'reserved_at' => null]);

            return $this->sendResponse($item, Response::HTTP_OK, 'Transfusion cancelled due to incompatible cross-match.');
        }

        $item->update([
            'status' => 'Cross-matching',
            'cross_match' => 'Compatible',
            'cross_match_time' => now(),
            'reaction_notes' => $request->notes,
        ]);
        $item->unit?->update(['status' => 'Cross-matched']);

        return $this->sendResponse($item, Response::HTTP_OK, 'Cross-match recorded as compatible.');
    }

    /**
     * Start a transfusion.
     */
    public function start(Request $request, $id)
    {
        $user = $request->user();
        $item = Transfusion::with('unit')->findOrFail($id);

        if (!in_array($item->status, ['Requested', 'Cross-matching'])) {
            return $this->sendError('Transfusion cannot be started in its current state.', Response::HTTP_CONFLICT);
        }

        $item->update([
            'status' => 'In-Progress',
            'administered_by' => $item->administered_by ?? $user->id,
            'started_at' => $item->started_at ?? now(),
        ]);
        $item->unit?->update(['status' => 'Issued', 'issued_at' => now()]);

        return $this->sendResponse($item, Response::HTTP_OK, 'Transfusion started successfully.');
    }

    /**
     * Complete a transfusion.
     */
    public function complete(Request $request, $id)
    {
        $request->validate([
            'vitals_before' => 'nullable|string|max:255',
            'vitals_after' => 'nullable|string|max:255',
            'reaction' => 'nullable|in:None,Febrile,Allergic,Hemolytic,Other',
            'reaction_notes' => 'nullable|string',
            'outcome' => 'nullable|string',
        ]);

        $item = Transfusion::with('unit')->findOrFail($id);

        if ($item->status !== 'In-Progress') {
            return $this->sendError('Only in-progress transfusions can be completed.', Response::HTTP_CONFLICT);
        }

        $item->update([
            'status' => 'Completed',
            'ended_at' => now(),
            'vitals_before' => $request->vitals_before,
            'vitals_after' => $request->vitals_after,
            'reaction' => $request->reaction,
            'reaction_notes' => $request->reaction_notes,
            'outcome' => $request->outcome,
        ]);

        return $this->sendResponse($item, Response::HTTP_OK, 'Transfusion completed successfully.');
    }

    /**
     * Cancel a transfusion.
     */
    public function cancel(Request $request, $id)
    {
        $item = Transfusion::with('unit')->findOrFail($id);

        if (in_array($item->status, ['Completed', 'Cancelled'])) {
            return $this->sendError('This transfusion cannot be cancelled.', Response::HTTP_CONFLICT);
        }

        $item->update(['status' => 'Cancelled']);
        $item->unit?->update(['status' => 'Available', 'patient_id' => null, 'reserved_at' => null]);

        return $this->sendResponse($item, Response::HTTP_OK, 'Transfusion cancelled successfully.');
    }

    /**
     * Get a patient's transfusion history.
     */
    public function patientHistory(Request $request, $patientId)
    {
        $items = Transfusion::with(['unit', 'administeredBy'])
            ->where('patient_id', $patientId)
            ->orderByDesc('created_at')
            ->get();

        return $this->sendResponse($items, Response::HTTP_OK, 'Transfusion history retrieved successfully.');
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
