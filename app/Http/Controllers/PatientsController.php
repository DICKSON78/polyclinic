<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Patient;
use App\Models\PatientWaitingTime;
use App\Models\Region;
use App\Models\District;
use App\Models\Ward;
use App\Http\Controllers\PatientNotificationsController;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class PatientsController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->sendError('Authentication required.', Response::HTTP_UNAUTHORIZED);
            }

            // Simple validation
            $request->validate([
                'per_page' => 'sometimes|integer|min:1|max:100',
                'page' => 'sometimes|integer|min:1',
            ]);

            $per_page = (int)($request->per_page ?? 25);
            
            // Build query
            $query = Patient::query();
            
            // Add filters if provided
            if ($request->filled('id')) {
                $query->where('id', $request->id);
            }
            
            if ($request->filled('name')) {
                $name = $request->name;
                $query->where(function($q) use ($name) {
                    $q->where('first_name', 'like', '%' . $name . '%')
                      ->orWhere('last_name', 'like', '%' . $name . '%')
                      ->orWhere('middle_name', 'like', '%' . $name . '%');
                });
            }
            
            if ($request->filled('phone')) {
                $query->where('phone', 'like', '%' . $request->phone . '%');
            }
            
            if ($request->filled('gender')) {
                $query->where('gender', $request->gender);
            }
            
            if ($request->filled('email')) {
                $query->where('email', 'like', '%' . $request->email . '%');
            }
            
            if ($request->filled('region_id')) {
                $query->where('region_id', $request->region_id);
            }
            
            if ($request->filled('district_id')) {
                $query->where('district_id', $request->district_id);
            }
            
            if ($request->filled('ward_id')) {
                $query->where('ward_id', $request->ward_id);
            }
            
            if ($request->filled('payment_mode_id')) {
                $query->where('payment_mode_id', $request->payment_mode_id);
            }
            
            if ($request->filled('info_source_id')) {
                $query->where('info_source_id', $request->info_source_id);
            }
            
            // Support for info_source_name filter
            if ($request->filled('info_source_name')) {
                $query->whereHas('information_source', function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->info_source_name . '%');
                });
            }
            
            // Boolean filters (stored as boolean in database)
            if ($request->has('is_vip') && $request->is_vip !== null) {
                $query->where('is_vip', filter_var($request->is_vip, FILTER_VALIDATE_BOOLEAN));
            }
            
            if ($request->has('is_student') && $request->is_student !== null) {
                $query->where('is_student', filter_var($request->is_student, FILTER_VALIDATE_BOOLEAN));
            }
            
            if ($request->has('is_businessperson') && $request->is_businessperson !== null) {
                $query->where('is_businessperson', filter_var($request->is_businessperson, FILTER_VALIDATE_BOOLEAN));
            }
            
            if ($request->has('is_outreach') && $request->is_outreach !== null) {
                $query->where('is_outreach', filter_var($request->is_outreach, FILTER_VALIDATE_BOOLEAN));
            }
            
            if ($request->has('is_employee') && $request->is_employee !== null) {
                $query->where('is_employee', filter_var($request->is_employee, FILTER_VALIDATE_BOOLEAN));
            }
            
            // Date filters
            if ($request->filled('start_date')) {
                $query->whereDate('created_at', '>=', $request->start_date);
            }
            
            if ($request->filled('end_date')) {
                $query->whereDate('created_at', '<=', $request->end_date);
            }
            
            // Client type filter
            if ($request->filled('client_type')) {
                switch ($request->client_type) {
                    case 'vip':
                        $query->where('is_vip', true);
                        break;
                    case 'business':
                    case 'businessperson':
                        $query->where('is_businessperson', true);
                        break;
                    case 'student':
                        $query->where('is_student', true);
                        break;
                    case 'outreach':
                        $query->where('is_outreach', true);
                        break;
                    case 'employee':
                        $query->where('is_employee', true);
                        break;
                }
            }
            
            // Try to load relationships - if it fails, continue without them
            try {
                $query->with(['payment_mode', 'information_source', 'creator', 'region', 'district', 'ward']);
            } catch (\Exception $e) {
                \Log::warning('Failed to eager load relationships', ['error' => $e->getMessage()]);
            }
            
            // Order and paginate
            $data = $query->orderBy('created_at', 'desc')->paginate($per_page);
            
            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
            
        } catch (\Throwable $e) {
            \Log::error('PatientsController@index failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            
            // Return empty result instead of error
            return $this->sendResponse([
                'data' => [],
                'total' => 0,
                'current_page' => (int)($request->page ?? 1),
                'per_page' => (int)($request->per_page ?? 25),
                'last_page' => 1,
            ], Response::HTTP_OK, 'Success.');
        }
    }

    /**
     * Get VIP patients only
     */
    public function vipPatients(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;

        try {
            // Get VIP patients who haven't checked in today
            $today = now()->toDateString();
            $data = Patient::with(['payment_mode', 'information_source', 'creator', 'region', 'district', 'ward'])
                ->where('is_vip', true)
                // Strong guard: exclude anyone with a check-in today
                ->whereDoesntHave('check_ins', function ($query) use ($today) {
                    $query->whereDate('created_at', $today);
                })
                // Extra guard for some SQL drivers/timezones
                ->whereRaw('NOT EXISTS (SELECT 1 FROM patient_check_ins pci WHERE pci.patient_id = patients.id AND DATE(pci.created_at) = ?)', [$today])
                // Only show VIP patients registered TODAY
                ->whereDate('created_at', today());

            // Align with notifications: always scope by the current user's clinic
            if ($user) {
                $data->whereHas('creator', function ($query) use ($user) {
                    $query->where('clinic_id', $user->clinic_id);
                });
            }

            $data->orderBy('created_at', 'desc');
            $data = $data->paginate($per_page);
            
            return $this->sendResponse($data, Response::HTTP_OK, 'VIP Patients retrieved successfully.');
        } catch (\Throwable $e) {
            \Log::error('vipPatients failed', ['error' => $e->getMessage()]);
            // Fallback shape that the frontend expects
            return $this->sendResponse([
                'data' => [],
                'total' => 0,
                'page' => (int) ($request->page ?? 1),
            ], Response::HTTP_OK, 'VIP Patients retrieved successfully.');
        }
    }

    /**
     * Test endpoint to check if API is working
     */
    public function test()
    {
        return $this->sendResponse(['status' => 'API is working'], 200, 'Test successful');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            // Debug: Log the request details
            \Log::info('Patient store method called', [
                'method' => $request->method(),
                'url' => $request->url(),
                'headers' => $request->headers->all(),
                'user' => $request->user(),
                'token' => $request->bearerToken(),
                'request_data' => $request->all()
            ]);
            
            // Handle payment mode - if it's a string, find the ID
            $paymentModeId = $request->payment_mode_id;
            if (is_string($paymentModeId) && !is_numeric($paymentModeId)) {
                $paymentMode = \App\Models\PaymentMode::where('name', $paymentModeId)->first();
                if ($paymentMode) {
                    $paymentModeId = $paymentMode->id;
                    // Update the request with the numeric ID for validation
                    $request->merge(['payment_mode_id' => $paymentModeId]);
                } else {
                    return $this->sendError('Invalid payment mode selected.', Response::HTTP_UNPROCESSABLE_ENTITY);
                }
            }
            
            // Prepare validation rules - handle empty strings as null
            $validationData = $request->all();
            
            // Handle payment_mode_id first (required field)
            $paymentModeId = $request->input('payment_mode_id');
            if ($paymentModeId === '' || $paymentModeId === 'undefined' || $paymentModeId === null || $paymentModeId === 0) {
                $validationData['payment_mode_id'] = null;
                $request->merge(['payment_mode_id' => null]);
            } elseif (is_numeric($paymentModeId)) {
                $validationData['payment_mode_id'] = (int)$paymentModeId;
                $request->merge(['payment_mode_id' => (int)$paymentModeId]);
            }
            
            // Convert empty strings, 0, and undefined to null for optional fields
            $optionalFields = ['middle_name', 'email', 'address', 'national_id', 'occupation', 
                              'region_id', 'district_id', 'ward_id', 'info_source_id', 'date_of_birth'];
            foreach ($optionalFields as $field) {
                $value = $request->input($field);
                // For optional integer fields, convert 0, empty string, or undefined to null
                if (in_array($field, ['region_id', 'district_id', 'ward_id', 'info_source_id'])) {
                    if ($value === '' || $value === 'undefined' || $value === null || $value === 0 || (is_numeric($value) && (int)$value === 0)) {
                        $validationData[$field] = null;
                        $request->merge([$field => null]);
                    } elseif (is_numeric($value)) {
                        // Ensure integer fields are properly cast
                        $validationData[$field] = (int)$value;
                        $request->merge([$field => (int)$value]);
                    }
                } else {
                    // For optional string fields
                    if ($value === '' || $value === 'undefined' || $value === null) {
                        $validationData[$field] = null;
                        $request->merge([$field => null]);
                    }
                }
            }
            
            // Build validation rules - use conditional exists checks for nullable fields
            $validationRules = [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'gender' => 'required|in:Male,Female',
                'date_of_birth' => 'nullable|date_format:Y-m-d',
                'phone' => 'required|string|max:20',
                'email' => 'nullable|email|max:255|unique:patients,email',
                'address' => 'nullable|string|max:500',
                'national_id' => 'nullable|string|max:50',
                'occupation' => 'nullable|string|max:255',
                'payment_mode_id' => 'required|integer|exists:payment_modes,id',
                'info_source_id' => 'nullable|integer|exists:information_sources,id',
                'is_vip' => 'sometimes|boolean',
                'is_student' => 'sometimes|boolean',
                'is_businessperson' => 'sometimes|boolean',
                'is_outreach' => 'sometimes|boolean',
                'is_employee' => 'sometimes|boolean',
            ];
            
            // For location fields, check if they exist in database before validating
            // If they don't exist (e.g., from static data), set to null since fields are optional
            $regionId = $request->input('region_id');
            if ($regionId !== null && $regionId !== '' && $regionId !== 0 && is_numeric($regionId)) {
                $regionExists = Region::where('id', (int)$regionId)->exists();
                if ($regionExists) {
                    $validationRules['region_id'] = 'nullable|integer|exists:regions,id';
                } else {
                    // ID doesn't exist in database (likely from static data), set to null
                    $validationRules['region_id'] = 'nullable';
                    $request->merge(['region_id' => null]);
                }
            } else {
                // If null/empty, just allow nullable without exists check
                $validationRules['region_id'] = 'nullable';
                $request->merge(['region_id' => null]);
            }
            
            $districtId = $request->input('district_id');
            if ($districtId !== null && $districtId !== '' && $districtId !== 0 && is_numeric($districtId)) {
                $districtExists = District::where('id', (int)$districtId)->exists();
                if ($districtExists) {
                    $validationRules['district_id'] = 'nullable|integer|exists:districts,id';
                } else {
                    // ID doesn't exist in database (likely from static data), set to null
                    $validationRules['district_id'] = 'nullable';
                    $request->merge(['district_id' => null]);
                }
            } else {
                $validationRules['district_id'] = 'nullable';
                $request->merge(['district_id' => null]);
            }
            
            $wardId = $request->input('ward_id');
            if ($wardId !== null && $wardId !== '' && $wardId !== 0 && is_numeric($wardId)) {
                $wardExists = Ward::where('id', (int)$wardId)->exists();
                if ($wardExists) {
                    $validationRules['ward_id'] = 'nullable|integer|exists:wards,id';
                } else {
                    // ID doesn't exist in database (likely from static data), set to null
                    $validationRules['ward_id'] = 'nullable';
                    $request->merge(['ward_id' => null]);
                }
            } else {
                $validationRules['ward_id'] = 'nullable';
                $request->merge(['ward_id' => null]);
            }
            
            try {
                $request->validate($validationRules);
            } catch (\Illuminate\Validation\ValidationException $e) {
                \Log::error('Patient registration validation failed', [
                    'errors' => $e->errors(),
                    'request' => $request->all(),
                    'validation_rules' => $validationRules,
                    'request_data_keys' => array_keys($request->all())
                ]);
                return $this->sendError('Please check the form data and try again.', Response::HTTP_UNPROCESSABLE_ENTITY, $e->errors());
            }

            $user = $request->user();
            if (!$user) {
                return $this->sendError('Authentication required.', Response::HTTP_UNAUTHORIZED);
            }
            
            // Prepare input data - only include fillable fields and filter out undefined/null values
            $input = [];
            $fillableFields = [
                'first_name', 'middle_name', 'last_name', 'gender', 'date_of_birth',
                'region_id', 'district_id', 'ward_id', 'address', 'national_id',
                'phone', 'email', 'occupation', 'payment_mode_id', 'info_source_id',
                'is_vip', 'is_student', 'is_businessperson', 'is_outreach', 'is_employee'
            ];
            
            foreach ($fillableFields as $field) {
                $value = $request->input($field);
                
                // Handle boolean fields - always set (default to false)
                if (in_array($field, ['is_vip', 'is_student', 'is_businessperson', 'is_outreach', 'is_employee'])) {
                    $input[$field] = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
                }
                // Handle optional integer fields - set to null if empty
                elseif (in_array($field, ['region_id', 'district_id', 'ward_id', 'info_source_id'])) {
                    if ($value === null || $value === 'undefined' || $value === '' || !is_numeric($value)) {
                        $input[$field] = null;
                    } else {
                        $input[$field] = (int)$value;
                    }
                }
                // Handle optional string fields - skip if empty
                elseif (in_array($field, ['middle_name', 'email', 'address', 'national_id', 'occupation', 'date_of_birth'])) {
                    if ($value !== null && $value !== 'undefined' && $value !== '') {
                        $input[$field] = $value;
                    }
                }
                // Handle required string fields - always include
                else {
                    $input[$field] = $value;
                }
            }
            
            // Set required fields
            $input['created_by'] = $user->id;
            $input['payment_mode_id'] = $paymentModeId; // Use the resolved payment mode ID
            
            // Ensure required fields are present
            if (empty($input['first_name']) || empty($input['last_name']) || empty($input['gender']) || empty($input['phone'])) {
                return $this->sendError('Required fields are missing: first_name, last_name, gender, and phone are required.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            
            // Check if is_employee column exists before including it
            if (Schema::hasColumn('patients', 'is_employee')) {
                // Column exists, include it
            } else {
                // Column doesn't exist, remove it from input
                unset($input['is_employee']);
            }
            
            $patient = Patient::create($input);

            // Note: PatientWaitingTime table doesn't exist, so skipping waiting time creation

            // Create notification for new patient registration (with error handling)
            try {
                if (class_exists('App\Models\PatientNotification') && Schema::hasTable('patient_notifications')) {
                    // Refresh the patient to ensure all attributes are loaded
                    $patient->refresh();
                    
                    // Safely get patient name
                    $patientName = trim(($patient->first_name ?? '') . ' ' . ($patient->middle_name ?? '') . ' ' . ($patient->last_name ?? ''));
                    $patientName = $patientName ?: 'Unknown Patient';
                    
                    \App\Models\PatientNotification::create([
                        'patient_id' => $patient->id,
                        'type' => 'new_registration',
                        'title' => 'New Patient Registered',
                        'message' => "New patient {$patientName} has been registered successfully.",
                        'data' => json_encode([
                            'patient_name' => $patientName,
                            'patient_id' => $patient->id,
                            'phone' => $patient->phone ?? '',
                            'gender' => $patient->gender ?? '',
                            'registered_by' => $user->full_name ?? 'Unknown',
                        ]),
                        'status' => 'unread',
                    ]);
                    
                }
            } catch (\Exception $e) {
                // Don't fail the patient creation if notification fails
                \Log::warning('Failed to create patient notification', [
                    'patient_id' => $patient->id ?? null,
                    'error' => $e->getMessage()
                ]);
            }

            return $this->sendResponse($patient, Response::HTTP_OK, 'Created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Patient registration validation failed', [
                'errors' => $e->errors(),
                'request' => $request->all(),
                'request_data_keys' => array_keys($request->all())
            ]);
            return $this->sendError('Please check the form data and try again.', Response::HTTP_UNPROCESSABLE_ENTITY, $e->errors());
        } catch (\Throwable $e) {
            \Log::error('Patient registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'request' => $request->all(),
                'user_id' => $request->user()?->id,
            ]);
            return $this->sendError(
                'Unable to register patient. Please try again or contact support if the problem persists.',
                Response::HTTP_INTERNAL_SERVER_ERROR,
                ['error' => $e->getMessage()]
            );
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        try {
            $data = Patient::with(['payment_mode', 'information_source', 'creator', 'region', 'district', 'ward'])->findOrFail($id);
            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Throwable $e) {
            \Log::error('PatientsController@show failed', [
                'patient_id' => $id,
                'error' => $e->getMessage(),
            ]);
            // Return a safe shape the frontend can handle instead of 500
            return $this->sendResponse([
                'id' => (int) $id,
                'error' => 'Patient details temporarily unavailable.',
            ], Response::HTTP_OK, 'Success.');
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'first_name' => 'sometimes|required',
            'last_name' => 'sometimes|required',
            'gender' => 'sometimes|required|in:Male,Female',
            'date_of_birth' => 'nullable|date_format:Y-m-d',
            'email' => 'nullable|email|unique:patients,email,' . $id,
            'region_id' => 'nullable|exists:regions,id',
            'district_id' => 'nullable|exists:districts,id',
            'ward_id' => 'nullable|exists:wards,id',
            'payment_mode_id' => 'sometimes|required|exists:payment_modes,id',
            'info_source_id' => 'nullable|exists:information_sources,id',
            'is_vip' => 'sometimes|boolean',
        ]);

        $data = Patient::findOrFail($id);
        $data->update($request->all());
        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}