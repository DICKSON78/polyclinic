<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\DeathCertificate;
use App\Models\MortuaryBody;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MortuaryController extends Controller
{
    use ApiResponse;

    /**
     * Mortuary dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $bodyQuery = MortuaryBody::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id));

        $certificateQuery = DeathCertificate::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id));

        $summary = [
            'in_storage' => (clone $bodyQuery)->where('status', 'In-Storage')->count(),
            'released' => (clone $bodyQuery)->where('status', 'Released')->count(),
            'cremated' => (clone $bodyQuery)->where('status', 'Cremated')->count(),
            'transferred' => (clone $bodyQuery)->where('status', 'Transferred')->count(),
            'total_bodies' => (clone $bodyQuery)->count(),
            'draft_certificates' => (clone $certificateQuery)->where('status', 'Draft')->count(),
            'issued_certificates' => (clone $certificateQuery)->where('status', 'Issued')->count(),
            'today_admissions' => (clone $bodyQuery)->whereDate('admitted_at', now()->toDateString())->count(),
        ];

        return $this->sendResponse($summary, Response::HTTP_OK, 'Mortuary dashboard retrieved successfully.');
    }

    /**
     * List mortuary bodies.
     */
    public function bodies(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:In-Storage,Released,Cremated,Transferred',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = MortuaryBody::with(['patient', 'admittedBy'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->q, function ($q, $search) {
                $q->where('body_no', 'like', "%{$search}%")
                    ->orWhere('deceased_name', 'like', "%{$search}%")
                    ->orWhere('storage_location', 'like', "%{$search}%");
            })
            ->orderByRaw("FIELD(status, 'In-Storage', 'Transferred', 'Released', 'Cremated') ASC, admitted_at DESC")
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Mortuary bodies retrieved successfully.');
    }

    /**
     * Store a new mortuary body admission.
     */
    public function storeBody(Request $request)
    {
        $request->validate([
            'patient_id' => 'nullable|exists:patients,id',
            'deceased_name' => 'required|string|max:150',
            'gender' => 'nullable|in:Male,Female',
            'age' => 'nullable|string|max:20',
            'date_of_death' => 'nullable|date',
            'cause_of_death' => 'nullable|string|max:255',
            'storage_location' => 'nullable|string|max:100',
            'received_by_name' => 'nullable|string|max:150',
            'received_by_phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $bodyNo = 'MB-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $item = MortuaryBody::create([
            'body_no' => $bodyNo,
            'clinic_id' => $user->clinic_id,
            'patient_id' => $request->patient_id,
            'deceased_name' => $request->deceased_name,
            'gender' => $request->gender,
            'age' => $request->age,
            'date_of_death' => $request->date_of_death,
            'cause_of_death' => $request->cause_of_death,
            'admitted_at' => now(),
            'admitted_by' => $user->id,
            'storage_location' => $request->storage_location,
            'status' => 'In-Storage',
            'received_by_name' => $request->received_by_name,
            'received_by_phone' => $request->received_by_phone,
            'notes' => $request->notes,
        ]);

        return $this->sendResponse(
            $item->load(['patient', 'admittedBy']),
            Response::HTTP_CREATED,
            'Body admitted to mortuary successfully.'
        );
    }

    /**
     * Update mortuary body details.
     */
    public function updateBody(Request $request, $id)
    {
        $request->validate([
            'deceased_name' => 'sometimes|string|max:150',
            'gender' => 'nullable|in:Male,Female',
            'age' => 'nullable|string|max:20',
            'date_of_death' => 'nullable|date',
            'cause_of_death' => 'nullable|string|max:255',
            'storage_location' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $item = MortuaryBody::findOrFail($id);
        $item->update($request->only([
            'deceased_name', 'gender', 'age', 'date_of_death',
            'cause_of_death', 'storage_location', 'notes',
        ]));

        return $this->sendResponse(
            $item->load(['patient', 'admittedBy']),
            Response::HTTP_OK,
            'Mortuary body updated successfully.'
        );
    }

    /**
     * Show a single mortuary body.
     */
    public function showBody(Request $request, $id)
    {
        $item = MortuaryBody::with(['patient', 'admittedBy', 'releasedBy', 'certificate'])
            ->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'Mortuary body retrieved successfully.');
    }

    /**
     * Release / transfer / cremate a body from the mortuary.
     */
    public function releaseBody(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Released,Cremated,Transferred',
            'received_by_name' => 'nullable|string|max:150',
            'received_by_phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $item = MortuaryBody::findOrFail($id);

        if ($item->status !== 'In-Storage') {
            return $this->sendError('Only bodies in storage can be released.', Response::HTTP_CONFLICT);
        }

        $item->update([
            'status' => $request->status,
            'released_at' => now(),
            'released_by' => $request->user()->id,
            'received_by_name' => $request->received_by_name,
            'received_by_phone' => $request->received_by_phone,
            'notes' => $request->notes ?? $item->notes,
        ]);

        return $this->sendResponse(
            $item->load(['patient', 'releasedBy']),
            Response::HTTP_OK,
            'Mortuary body released successfully.'
        );
    }

    /**
     * List death certificates.
     */
    public function certificates(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Draft,Issued,Void',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = DeathCertificate::with(['patient', 'doctor'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->q, function ($q, $search) {
                $q->where('certificate_no', 'like', "%{$search}%")
                    ->orWhere('deceased_name', 'like', "%{$search}%")
                    ->orWhere('cause_of_death', 'like', "%{$search}%");
            })
            ->orderByRaw("FIELD(status, 'Draft', 'Issued') ASC, created_at DESC")
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Death certificates retrieved successfully.');
    }

    /**
     * Store a new death certificate draft.
     */
    public function storeCertificate(Request $request)
    {
        $request->validate([
            'body_id' => 'nullable|exists:mortuary_bodies,id',
            'patient_id' => 'nullable|exists:patients,id',
            'deceased_name' => 'required|string|max:150',
            'gender' => 'nullable|in:Male,Female',
            'date_of_birth' => 'nullable|date',
            'date_of_death' => 'nullable|date',
            'place_of_death' => 'nullable|string|max:255',
            'cause_of_death' => 'nullable|string|max:255',
            'doctor_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $certNo = 'DC-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $item = DeathCertificate::create([
            'certificate_no' => $certNo,
            'clinic_id' => $user->clinic_id,
            'body_id' => $request->body_id,
            'patient_id' => $request->patient_id,
            'deceased_name' => $request->deceased_name,
            'gender' => $request->gender,
            'date_of_birth' => $request->date_of_birth,
            'date_of_death' => $request->date_of_death,
            'place_of_death' => $request->place_of_death,
            'cause_of_death' => $request->cause_of_death,
            'doctor_id' => $request->doctor_id,
            'status' => 'Draft',
            'notes' => $request->notes,
        ]);

        return $this->sendResponse(
            $item->load(['patient', 'doctor', 'body']),
            Response::HTTP_CREATED,
            'Death certificate created successfully.'
        );
    }

    /**
     * Show a single death certificate.
     */
    public function showCertificate(Request $request, $id)
    {
        $item = DeathCertificate::with(['patient', 'doctor', 'body'])
            ->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'Death certificate retrieved successfully.');
    }

    /**
     * Mark a certificate as issued.
     */
    public function issueCertificate(Request $request, $id)
    {
        $item = DeathCertificate::findOrFail($id);

        if ($item->status !== 'Draft') {
            return $this->sendError('Only draft certificates can be issued.', Response::HTTP_CONFLICT);
        }

        $item->update([
            'status' => 'Issued',
            'issued_at' => now(),
        ]);

        return $this->sendResponse(
            $item->load(['patient', 'doctor', 'body']),
            Response::HTTP_OK,
            'Death certificate issued successfully.'
        );
    }

    /**
     * Void a certificate.
     */
    public function voidCertificate(Request $request, $id)
    {
        $item = DeathCertificate::findOrFail($id);

        if ($item->status === 'Void') {
            return $this->sendError('Certificate is already void.', Response::HTTP_CONFLICT);
        }

        $item->update(['status' => 'Void']);

        return $this->sendResponse(
            $item->load(['patient', 'doctor', 'body']),
            Response::HTTP_OK,
            'Death certificate voided successfully.'
        );
    }

    /**
     * List staff (doctors) for certificate assignment.
     */
    public function staff(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = User::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->role, fn ($q, $role) => $q->where('role', $role))
            ->where('status', 'Active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'middle_name', 'last_name', 'role', 'phone']);

        return $this->sendResponse($items, Response::HTTP_OK, 'Staff retrieved successfully.');
    }
}
