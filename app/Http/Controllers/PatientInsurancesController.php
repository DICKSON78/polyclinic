<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientInsurance;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientInsurancesController extends Controller
{
    use ApiResponse;

    /**
     * List insurance memberships for a patient.
     */
    public function index(Request $request, $patientId)
    {
        $request->validate([
            'status' => 'sometimes|in:Active,Inactive',
        ]);

        $data = PatientInsurance::with(['insurance_company'])
            ->where('patient_id', $patientId)
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->orderByDesc('updated_at')
            ->get();

        return $this->sendResponse($data, Response::HTTP_OK, 'Patient insurances retrieved successfully.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'insurance_company_id' => 'required|exists:insurance_companies,id',
            'member_number' => 'nullable|string|max:100',
            'card_number' => 'nullable|string|max:100',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $data = PatientInsurance::create([
            'patient_id' => $request->patient_id,
            'insurance_company_id' => $request->insurance_company_id,
            'member_number' => $request->member_number,
            'card_number' => $request->card_number,
            'valid_from' => $request->valid_from,
            'valid_until' => $request->valid_until,
            'status' => $request->status ?? 'Active',
        ]);

        return $this->sendResponse($data->load(['insurance_company']), Response::HTTP_CREATED, 'Patient insurance created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'insurance_company_id' => 'sometimes|exists:insurance_companies,id',
            'member_number' => 'nullable|string|max:100',
            'card_number' => 'nullable|string|max:100',
            'valid_from' => 'nullable|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
            'status' => 'sometimes|in:Active,Inactive',
        ]);

        $data = PatientInsurance::findOrFail($id);
        $data->update($request->only(
            'insurance_company_id', 'member_number', 'card_number', 'valid_from', 'valid_until', 'status'
        ));

        return $this->sendResponse($data->load(['insurance_company']), Response::HTTP_OK, 'Patient insurance updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $data = PatientInsurance::findOrFail($id);
        $data->delete();

        return $this->sendResponse($data, Response::HTTP_OK, 'Patient insurance deleted successfully.');
    }
}
