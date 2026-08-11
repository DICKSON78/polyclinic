<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\InsuranceCompany;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InsuranceCompaniesController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 100;
        $status = $request->status;
        $q = $request->q;

        $data = InsuranceCompany::query();

        if ($user->is_admin) {
            $data->with(['clinic']);
            if ($request->clinic_id) {
                $data->where('clinic_id', $request->clinic_id);
            }
        } elseif ($user->clinic_id) {
            $data->where('clinic_id', $user->clinic_id);
        } else {
            $data->whereRaw('1 = 0');
        }

        if ($status) {
            $data->where('status', $status);
        }

        if ($q) {
            $data->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%");
            });
        }

        return $this->sendResponse($data->orderBy('name')->paginate($per_page), Response::HTTP_OK, 'Insurance companies retrieved successfully.');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'type' => 'nullable|in:Government,Private',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $user = $request->user();

        $data = InsuranceCompany::create([
            'clinic_id' => $user->is_admin ? ($request->clinic_id ?? $user->clinic_id) : $user->clinic_id,
            'name' => $request->name,
            'code' => $request->code,
            'type' => $request->type ?? 'Private',
            'contact_person' => $request->contact_person,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'status' => $request->status ?? 'Active',
        ]);

        return $this->sendResponse($data, Response::HTTP_CREATED, 'Insurance company created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $data = InsuranceCompany::with(['patient_insurances.patient'])->findOrFail($id);

        return $this->sendResponse($data, Response::HTTP_OK, 'Insurance company retrieved successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50',
            'type' => 'sometimes|in:Government,Private',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'status' => 'sometimes|in:Active,Inactive',
        ]);

        $data = InsuranceCompany::findOrFail($id);
        $data->update($request->only('name', 'code', 'type', 'contact_person', 'phone', 'email', 'address', 'status'));

        return $this->sendResponse($data, Response::HTTP_OK, 'Insurance company updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $data = InsuranceCompany::findOrFail($id);
        $data->delete();

        return $this->sendResponse($data, Response::HTTP_OK, 'Insurance company deleted successfully.');
    }
}
