<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Admission;
use App\Models\Bed;
use App\Models\HospitalWard;
use App\Models\InpatientNote;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class InpatientController extends Controller
{
    use ApiResponse;

    /**
     * Get the inpatient dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $wardScope = fn ($q) => $q->when($clinic_id, fn ($w) => $w->where('clinic_id', $clinic_id));

        $totalWards = HospitalWard::query()->where('status', 'Active')->where(fn ($q) => $wardScope($q))->count();
        $totalBeds = Bed::query()->where(fn ($q) => $wardScope($q))->count();
        $occupiedBeds = Bed::query()->where('status', 'Occupied')->where(fn ($q) => $wardScope($q))->count();
        $availableBeds = Bed::query()->where('status', 'Available')->where(fn ($q) => $wardScope($q))->count();

        $admitted = Admission::where('status', 'Admitted')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $admissionsToday = Admission::whereDate('admission_date', Carbon::today())
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $dischargedToday = Admission::where('status', 'Discharged')
            ->whereDate('discharge_date', Carbon::today())
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $critical = Admission::where('status', 'Admitted')
            ->whereIn('condition', ['Serious', 'Critical'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        return $this->sendResponse([
            'total_wards' => (int) $totalWards,
            'total_beds' => (int) $totalBeds,
            'occupied_beds' => (int) $occupiedBeds,
            'available_beds' => (int) $availableBeds,
            'occupancy_rate' => $totalBeds > 0 ? round(($occupiedBeds / $totalBeds) * 100, 1) : 0,
            'admitted' => (int) $admitted,
            'admissions_today' => (int) $admissionsToday,
            'discharged_today' => (int) $dischargedToday,
            'critical' => (int) $critical,
            'date' => Carbon::today()->toDateString(),
        ], Response::HTTP_OK, 'Inpatient dashboard retrieved successfully.');
    }

    /**
     * List hospital wards with bed summaries.
     */
    public function wards(Request $request)
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

        $items = HospitalWard::withCount(['beds as total_beds'])
            ->withCount(['availableBeds as available_beds'])
            ->with(['beds' => fn ($q) => $q->where('status', 'Occupied')])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Wards retrieved successfully.');
    }

    /**
     * Create a new hospital ward.
     */
    public function storeWard(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:hospital_wards,code',
            'ward_type' => 'nullable|string|max:100',
            'floor' => 'nullable|string|max:100',
            'bed_capacity' => 'nullable|integer|min:0',
            'price_per_day' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $item = HospitalWard::create([
            'clinic_id' => $request->user()->clinic_id,
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'ward_type' => $request->ward_type ?? 'General',
            'floor' => $request->floor,
            'bed_capacity' => $request->bed_capacity ?? 0,
            'price_per_day' => $request->price_per_day ?? 0,
            'description' => $request->description,
            'status' => $request->status ?? 'Active',
        ]);

        return $this->sendResponse($item, Response::HTTP_CREATED, 'Ward created successfully.');
    }

    /**
     * Update a hospital ward.
     */
    public function updateWard(Request $request, $id)
    {
        $item = HospitalWard::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:20|unique:hospital_wards,code,' . $id,
            'ward_type' => 'nullable|string|max:100',
            'floor' => 'nullable|string|max:100',
            'bed_capacity' => 'nullable|integer|min:0',
            'price_per_day' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $item->fill($request->only([
            'name', 'code', 'ward_type', 'floor', 'bed_capacity', 'price_per_day', 'description', 'status',
        ]));
        if ($item->code) {
            $item->code = strtoupper($item->code);
        }
        $item->save();

        return $this->sendResponse($item, Response::HTTP_OK, 'Ward updated successfully.');
    }

    /**
     * Delete a hospital ward.
     */
    public function destroyWard(Request $request, $id)
    {
        $item = HospitalWard::findOrFail($id);

        if ($item->beds()->exists()) {
            return $this->sendError('Cannot delete this ward because it has beds assigned to it.', Response::HTTP_CONFLICT);
        }

        $item->delete();

        return $this->sendResponse($item, Response::HTTP_OK, 'Ward deleted successfully.');
    }

    /**
     * List beds with ward info.
     */
    public function beds(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string',
            'ward_id' => 'sometimes|exists:hospital_wards,id',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = Bed::with(['ward', 'patient'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->ward_id, fn ($q, $wardId) => $q->where('hospital_ward_id', $wardId))
            ->when($request->q, function ($q, $search) {
                $q->where('bed_number', 'like', "%{$search}%");
            })
            ->orderBy('hospital_ward_id')
            ->orderBy('bed_number')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Beds retrieved successfully.');
    }

    /**
     * Create a new bed.
     */
    public function storeBed(Request $request)
    {
        $request->validate([
            'hospital_ward_id' => 'required|exists:hospital_wards,id',
            'bed_number' => 'required|string|max:50',
            'bed_type' => 'nullable|string|max:100',
        ]);

        $ward = HospitalWard::findOrFail($request->hospital_ward_id);

        $existing = Bed::where('hospital_ward_id', $request->hospital_ward_id)
            ->where('bed_number', $request->bed_number)
            ->exists();

        if ($existing) {
            return $this->sendError('A bed with this number already exists in the selected ward.', Response::HTTP_CONFLICT);
        }

        $item = Bed::create([
            'clinic_id' => $ward->clinic_id ?? $request->user()->clinic_id,
            'hospital_ward_id' => $request->hospital_ward_id,
            'bed_number' => $request->bed_number,
            'bed_type' => $request->bed_type ?? 'Regular',
            'status' => 'Available',
        ]);

        return $this->sendResponse($item->load('ward'), Response::HTTP_CREATED, 'Bed created successfully.');
    }

    /**
     * Update a bed.
     */
    public function updateBed(Request $request, $id)
    {
        $item = Bed::findOrFail($id);

        $request->validate([
            'hospital_ward_id' => 'sometimes|required|exists:hospital_wards,id',
            'bed_number' => 'sometimes|required|string|max:50',
            'bed_type' => 'nullable|string|max:100',
            'status' => 'nullable|in:Available,Occupied,Reserved,Maintenance',
        ]);

        if ($item->status === 'Occupied' && $request->has('status') && $request->status === 'Available') {
            return $this->sendError('Cannot mark an occupied bed as available. Discharge or transfer the patient first.', Response::HTTP_CONFLICT);
        }

        if (($request->has('hospital_ward_id') && $request->hospital_ward_id != $item->hospital_ward_id)
            || $request->has('bed_number')
        ) {
            $wardId = $request->hospital_ward_id ?? $item->hospital_ward_id;
            $number = $request->bed_number ?? $item->bed_number;
            $exists = Bed::where('hospital_ward_id', $wardId)
                ->where('bed_number', $number)
                ->where('id', '!=', $item->id)
                ->exists();
            if ($exists) {
                return $this->sendError('A bed with this number already exists in the selected ward.', Response::HTTP_CONFLICT);
            }
        }

        $item->fill($request->only(['hospital_ward_id', 'bed_number', 'bed_type', 'status']));
        $item->save();

        return $this->sendResponse($item->load('ward'), Response::HTTP_OK, 'Bed updated successfully.');
    }

    /**
     * Delete a bed.
     */
    public function destroyBed(Request $request, $id)
    {
        $item = Bed::findOrFail($id);

        if ($item->status === 'Occupied') {
            return $this->sendError('Cannot delete an occupied bed. Discharge or transfer the patient first.', Response::HTTP_CONFLICT);
        }

        $item->delete();

        return $this->sendResponse($item, Response::HTTP_OK, 'Bed deleted successfully.');
    }

    /**
     * List admissions.
     */
    public function admissions(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string',
            'q' => 'sometimes|string|max:100',
            'date' => 'sometimes|date',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = Admission::with(['patient', 'ward', 'bed', 'admittedBy', 'doctor', 'dischargedBy'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->date, fn ($q, $date) => $q->whereDate('admission_date', $date))
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('admission_no', 'like', "%{$search}%")
                        ->orWhere('admission_reason', 'like', "%{$search}%")
                        ->orWhere('diagnosis', 'like', "%{$search}%")
                        ->orWhereHas('patient', function ($patient) use ($search) {
                            $patient->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('admission_date')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Admissions retrieved successfully.');
    }

    /**
     * Get a single admission.
     */
    public function showAdmission(Request $request, $id)
    {
        $item = Admission::with([
            'patient', 'ward', 'bed', 'admittedBy', 'doctor', 'dischargedBy',
            'notes' => fn ($q) => $q->orderByDesc('noted_at')->with('notedBy'),
        ])->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'Admission retrieved successfully.');
    }

    /**
     * Admit a patient to a bed.
     */
    public function admit(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'bed_id' => 'required|exists:beds,id',
            'doctor_id' => 'nullable|exists:users,id',
            'admission_date' => 'nullable|date',
            'admission_reason' => 'nullable|string|max:255',
            'diagnosis' => 'nullable|string',
            'condition' => 'nullable|in:Stable,Serious,Critical',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $bed = Bed::with('ward')->findOrFail($request->bed_id);

        if ($bed->status === 'Occupied') {
            return $this->sendError('The selected bed is already occupied.', Response::HTTP_CONFLICT);
        }

        $activeAdmission = Admission::where('patient_id', $request->patient_id)
            ->where('status', 'Admitted')
            ->exists();

        if ($activeAdmission) {
            return $this->sendError('This patient already has an active admission.', Response::HTTP_CONFLICT);
        }

        $admissionNo = 'AD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $item = DB::transaction(function () use ($request, $user, $bed, $admissionNo) {
            $admission = Admission::create([
                'admission_no' => $admissionNo,
                'clinic_id' => $bed->clinic_id ?? $user->clinic_id,
                'patient_id' => $request->patient_id,
                'hospital_ward_id' => $bed->hospital_ward_id,
                'bed_id' => $bed->id,
                'admitted_by' => $user->id,
                'doctor_id' => $request->doctor_id,
                'admission_date' => $request->admission_date ? Carbon::parse($request->admission_date) : now(),
                'admission_reason' => $request->admission_reason,
                'diagnosis' => $request->diagnosis,
                'condition' => $request->condition ?? 'Stable',
                'notes' => $request->notes,
                'status' => 'Admitted',
            ]);

            $bed->status = 'Occupied';
            $bed->patient_id = $request->patient_id;
            $bed->save();

            return $admission;
        });

        return $this->sendResponse(
            $item->load(['patient', 'ward', 'bed', 'admittedBy', 'doctor']),
            Response::HTTP_CREATED,
            'Patient admitted successfully.'
        );
    }

    /**
     * Discharge a patient.
     */
    public function discharge(Request $request, $id)
    {
        $request->validate([
            'discharge_reason' => 'nullable|string|max:255',
            'discharge_notes' => 'nullable|string',
        ]);

        $item = Admission::findOrFail($id);

        if ($item->status === 'Discharged') {
            return $this->sendError('This admission is already discharged.', Response::HTTP_CONFLICT);
        }

        $user = $request->user();

        DB::transaction(function () use ($request, $item, $user) {
            $item->status = 'Discharged';
            $item->discharge_reason = $request->discharge_reason;
            $item->discharge_notes = $request->discharge_notes;
            $item->discharged_by = $user->id;
            $item->discharge_date = now();
            $item->save();

            if ($item->bed_id) {
                $bed = Bed::find($item->bed_id);
                if ($bed) {
                    $bed->status = 'Available';
                    $bed->patient_id = null;
                    $bed->save();
                }
            }
        });

        return $this->sendResponse(
            $item->load(['patient', 'ward', 'bed', 'admittedBy', 'doctor', 'dischargedBy']),
            Response::HTTP_OK,
            'Patient discharged successfully.'
        );
    }

    /**
     * Transfer a patient to another bed.
     */
    public function transfer(Request $request, $id)
    {
        $request->validate([
            'bed_id' => 'required|exists:beds,id',
        ]);

        $item = Admission::findOrFail($id);

        if ($item->status === 'Discharged') {
            return $this->sendError('Cannot transfer a discharged admission.', Response::HTTP_CONFLICT);
        }

        $newBed = Bed::with('ward')->findOrFail($request->bed_id);

        if ($newBed->status === 'Occupied') {
            return $this->sendError('The selected bed is already occupied.', Response::HTTP_CONFLICT);
        }

        $oldBed = $item->bed_id ? Bed::find($item->bed_id) : null;

        DB::transaction(function () use ($item, $newBed, $oldBed) {
            if ($oldBed && $oldBed->id !== $newBed->id) {
                $oldBed->status = 'Available';
                $oldBed->patient_id = null;
                $oldBed->save();
            }

            $item->bed_id = $newBed->id;
            $item->hospital_ward_id = $newBed->hospital_ward_id;
            $item->save();

            $newBed->status = 'Occupied';
            $newBed->patient_id = $item->patient_id;
            $newBed->save();
        });

        return $this->sendResponse(
            $item->load(['patient', 'ward', 'bed']),
            Response::HTTP_OK,
            'Patient transferred successfully.'
        );
    }

    /**
     * List inpatient notes.
     */
    public function notes(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'admission_id' => 'sometimes|exists:admissions,id',
            'patient_id' => 'sometimes|exists:patients,id',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = InpatientNote::with(['admission', 'patient', 'notedBy'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->admission_id, fn ($q, $value) => $q->where('admission_id', $value))
            ->when($request->patient_id, fn ($q, $value) => $q->where('patient_id', $value))
            ->when($request->q, function ($q, $search) {
                $q->where('note_text', 'like', "%{$search}%");
            })
            ->orderByDesc('noted_at')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Notes retrieved successfully.');
    }

    /**
     * Add an inpatient note.
     */
    public function storeNote(Request $request)
    {
        $request->validate([
            'admission_id' => 'required|exists:admissions,id',
            'note_type' => 'nullable|in:Progress,Nursing,Physician,Procedure,Other',
            'note_text' => 'required|string',
            'noted_at' => 'nullable|date',
        ]);

        $admission = Admission::findOrFail($request->admission_id);
        $user = $request->user();

        $item = InpatientNote::create([
            'clinic_id' => $admission->clinic_id ?? $user->clinic_id,
            'admission_id' => $admission->id,
            'patient_id' => $admission->patient_id,
            'noted_by' => $user->id,
            'note_type' => $request->note_type ?? 'Progress',
            'note_text' => $request->note_text,
            'noted_at' => $request->noted_at ? Carbon::parse($request->noted_at) : now(),
        ]);

        return $this->sendResponse(
            $item->load(['admission', 'patient', 'notedBy']),
            Response::HTTP_CREATED,
            'Note added successfully.'
        );
    }

    /**
     * Delete an inpatient note.
     */
    public function destroyNote(Request $request, $id)
    {
        $item = InpatientNote::findOrFail($id);
        $item->delete();

        return $this->sendResponse($item, Response::HTTP_OK, 'Note deleted successfully.');
    }

    /**
     * Get admission history for a patient.
     */
    public function patientHistory(Request $request, $patientId)
    {
        $items = Admission::with(['ward', 'bed', 'admittedBy', 'doctor', 'dischargedBy'])
            ->where('patient_id', $patientId)
            ->orderByDesc('admission_date')
            ->paginate($request->get('per_page', 20));

        return $this->sendResponse($items, Response::HTTP_OK, 'Admission history retrieved successfully.');
    }
}
