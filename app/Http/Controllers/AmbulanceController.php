<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\AmbulanceRequest;
use App\Models\AmbulanceTrip;
use App\Models\AmbulanceVehicle;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class AmbulanceController extends Controller
{
    use ApiResponse;

    /**
     * Ambulance dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $vehicleQuery = AmbulanceVehicle::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id));

        $requestQuery = AmbulanceRequest::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id));

        $tripQuery = AmbulanceTrip::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id));

        $summary = [
            'available_vehicles' => (clone $vehicleQuery)->where('status', 'Available')->count(),
            'on_trip' => (clone $vehicleQuery)->where('status', 'On-Trip')->count(),
            'in_maintenance' => (clone $vehicleQuery)->where('status', 'Maintenance')->count(),
            'pending_requests' => (clone $requestQuery)->where('status', 'Pending')->count(),
            'assigned' => (clone $requestQuery)->where('status', 'Assigned')->count(),
            'in_progress' => (clone $requestQuery)->where('status', 'In-Progress')->count(),
            'today_requests' => (clone $requestQuery)->whereDate('created_at', now()->toDateString())->count(),
            'today_trips' => (clone $tripQuery)->whereDate('dispatched_at', now()->toDateString())->count(),
        ];

        return $this->sendResponse($summary, Response::HTTP_OK, 'Ambulance dashboard retrieved successfully.');
    }

    /**
     * List ambulance vehicles.
     */
    public function vehicles(Request $request)
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

        $items = AmbulanceVehicle::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->q, function ($q, $search) {
                $q->where('registration_no', 'like', "%{$search}%")
                    ->orWhere('driver_name', 'like', "%{$search}%")
                    ->orWhere('vehicle_type', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%");
            })
            ->orderByRaw("FIELD(status, 'Available', 'On-Trip', 'Maintenance', 'Out-of-Service') ASC")
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Ambulance vehicles retrieved successfully.');
    }

    /**
     * Store a new ambulance vehicle.
     */
    public function storeVehicle(Request $request)
    {
        $request->validate([
            'registration_no' => 'required|string|max:50|unique:ambulance_vehicles,registration_no',
            'vehicle_type' => 'nullable|in:Ambulance,Patient Van,Boat',
            'model' => 'nullable|string|max:100',
            'capacity' => 'nullable|string|max:20',
            'driver_name' => 'nullable|string|max:100',
            'driver_phone' => 'nullable|string|max:20',
            'attendant_name' => 'nullable|string|max:100',
            'attendant_phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:Available,On-Trip,Maintenance,Out-of-Service',
            'equipment_notes' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $item = AmbulanceVehicle::create([
            'registration_no' => $request->registration_no,
            'clinic_id' => $user->clinic_id,
            'vehicle_type' => $request->vehicle_type ?? 'Ambulance',
            'model' => $request->model,
            'capacity' => $request->capacity,
            'driver_name' => $request->driver_name,
            'driver_phone' => $request->driver_phone,
            'attendant_name' => $request->attendant_name,
            'attendant_phone' => $request->attendant_phone,
            'status' => $request->status ?? 'Available',
            'equipment_notes' => $request->equipment_notes,
            'notes' => $request->notes,
        ]);

        return $this->sendResponse($item, Response::HTTP_CREATED, 'Ambulance vehicle added successfully.');
    }

    /**
     * Update an ambulance vehicle.
     */
    public function updateVehicle(Request $request, $id)
    {
        $request->validate([
            'registration_no' => 'sometimes|string|max:50|unique:ambulance_vehicles,registration_no,' . $id,
            'vehicle_type' => 'nullable|in:Ambulance,Patient Van,Boat',
            'model' => 'nullable|string|max:100',
            'capacity' => 'nullable|string|max:20',
            'driver_name' => 'nullable|string|max:100',
            'driver_phone' => 'nullable|string|max:20',
            'attendant_name' => 'nullable|string|max:100',
            'attendant_phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:Available,On-Trip,Maintenance,Out-of-Service',
            'equipment_notes' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $item = AmbulanceVehicle::findOrFail($id);
        $item->update($request->only([
            'registration_no', 'vehicle_type', 'model', 'capacity', 'driver_name',
            'driver_phone', 'attendant_name', 'attendant_phone', 'status',
            'equipment_notes', 'notes',
        ]));

        return $this->sendResponse($item, Response::HTTP_OK, 'Ambulance vehicle updated successfully.');
    }

    /**
     * List ambulance requests.
     */
    public function requests(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Pending,Assigned,In-Progress,Completed,Cancelled',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = AmbulanceRequest::with(['patient', 'requester', 'trip.vehicle'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->q, function ($q, $search) {
                $q->where('request_no', 'like', "%{$search}%")
                    ->orWhere('pickup_location', 'like', "%{$search}%")
                    ->orWhere('destination', 'like', "%{$search}%")
                    ->orWhereHas('patient', function ($p) use ($search) {
                        $p->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });
            })
            ->orderByRaw("FIELD(status, 'Pending', 'Assigned', 'In-Progress') ASC, created_at DESC")
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Ambulance requests retrieved successfully.');
    }

    /**
     * Show a single ambulance request.
     */
    public function showRequest(Request $request, $id)
    {
        $item = AmbulanceRequest::with(['patient', 'requester', 'trip.vehicle', 'trip.driver'])
            ->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'Ambulance request retrieved successfully.');
    }

    /**
     * Store a new ambulance request.
     */
    public function storeRequest(Request $request)
    {
        $request->validate([
            'patient_id' => 'nullable|exists:patients,id',
            'pickup_location' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'pickup_time' => 'nullable|date',
            'patient_condition' => 'nullable|in:Stable,Moderate,Critical',
            'transport_type' => 'nullable|in:Emergency,Routine,Inter-facility,Discharge',
            'special_requirements' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        $requestNo = 'AR-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $item = AmbulanceRequest::create([
            'request_no' => $requestNo,
            'clinic_id' => $user->clinic_id,
            'patient_id' => $request->patient_id,
            'requested_by' => $user->id,
            'pickup_location' => $request->pickup_location,
            'destination' => $request->destination,
            'pickup_time' => $request->pickup_time,
            'patient_condition' => $request->patient_condition,
            'transport_type' => $request->transport_type ?? 'Emergency',
            'special_requirements' => $request->special_requirements,
            'status' => 'Pending',
            'notes' => $request->notes,
        ]);

        return $this->sendResponse(
            $item->load(['patient', 'requester']),
            Response::HTTP_CREATED,
            'Ambulance request created successfully.'
        );
    }

    /**
     * Assign a vehicle to a request and dispatch a trip.
     */
    public function assign(Request $request, $id)
    {
        $request->validate([
            'vehicle_id' => 'required|exists:ambulance_vehicles,id',
            'driver_id' => 'nullable|exists:users,id',
            'attendant_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $item = AmbulanceRequest::findOrFail($id);

        if (!in_array($item->status, ['Pending', 'Assigned'])) {
            return $this->sendError('Only pending or assigned requests can be dispatched.', Response::HTTP_CONFLICT);
        }

        $vehicle = AmbulanceVehicle::findOrFail($request->vehicle_id);

        if ($vehicle->status !== 'Available') {
            return $this->sendError('The selected vehicle is not available.', Response::HTTP_CONFLICT);
        }

        $user = $request->user();
        $tripNo = 'AT-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $result = DB::transaction(function () use ($request, $user, $item, $vehicle, $tripNo) {
            $trip = AmbulanceTrip::create([
                'trip_no' => $tripNo,
                'clinic_id' => $user->clinic_id,
                'request_id' => $item->id,
                'vehicle_id' => $vehicle->id,
                'driver_id' => $request->driver_id,
                'attendant_id' => $request->attendant_id,
                'dispatched_at' => now(),
                'status' => 'Dispatched',
                'notes' => $request->notes,
            ]);

            $item->update(['status' => 'Assigned']);
            $vehicle->update(['status' => 'On-Trip']);

            return $trip;
        });

        return $this->sendResponse(
            $result->load(['request.patient', 'vehicle', 'driver']),
            Response::HTTP_CREATED,
            'Vehicle dispatched successfully.'
        );
    }

    /**
     * List ambulance trips.
     */
    public function trips(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Dispatched,En-Route,On-Scene,Transporting,Completed,Cancelled',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = AmbulanceTrip::with(['request.patient', 'vehicle', 'driver'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->q, function ($q, $search) {
                $q->where('trip_no', 'like', "%{$search}%")
                    ->orWhereHas('request', function ($r) use ($search) {
                        $r->where('request_no', 'like', "%{$search}%")
                            ->orWhere('destination', 'like', "%{$search}%");
                    })
                    ->orWhereHas('vehicle', function ($v) use ($search) {
                        $v->where('registration_no', 'like', "%{$search}%");
                    });
            })
            ->orderByRaw("FIELD(status, 'Dispatched', 'En-Route', 'On-Scene', 'Transporting') ASC, dispatched_at DESC")
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Ambulance trips retrieved successfully.');
    }

    /**
     * Advance a trip to its next stage.
     */
    public function advanceTrip(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:En-Route,On-Scene,Transporting,Completed,Cancelled',
            'trip_report' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $trip = AmbulanceTrip::with('request')->findOrFail($id);

        $transitions = [
            'Dispatched' => ['En-Route', 'On-Scene', 'Transporting', 'Completed', 'Cancelled'],
            'En-Route' => ['On-Scene', 'Transporting', 'Completed', 'Cancelled'],
            'On-Scene' => ['Transporting', 'Completed', 'Cancelled'],
            'Transporting' => ['Completed', 'Cancelled'],
        ];

        $allowed = $transitions[$trip->status] ?? [];

        if (!in_array($request->status, $allowed)) {
            return $this->sendError('Invalid status transition.', Response::HTTP_CONFLICT);
        }

        $update = ['status' => $request->status, 'notes' => $request->notes];

        if ($request->has('trip_report') && $request->trip_report) {
            $update['trip_report'] = $request->trip_report;
        }

        if ($request->status === 'On-Scene' && !$trip->arrived_at_pickup) {
            $update['arrived_at_pickup'] = now();
        }

        if ($request->status === 'Transporting' && !$trip->departed_pickup) {
            $update['departed_pickup'] = now();
        }

        if ($request->status === 'Completed') {
            $update['arrived_at_destination'] = now();

            $trip->request?->update(['status' => 'Completed']);
            $trip->vehicle?->update(['status' => 'Available']);
        }

        if ($request->status === 'Cancelled') {
            $trip->request?->update(['status' => 'Cancelled']);
            $trip->vehicle?->update(['status' => 'Available']);
        }

        if (in_array($request->status, ['En-Route', 'On-Scene', 'Transporting']) && $trip->request) {
            $trip->request->update(['status' => 'In-Progress']);
        }

        $trip->update($update);

        return $this->sendResponse(
            $trip->load(['request.patient', 'vehicle', 'driver', 'attendant']),
            Response::HTTP_OK,
            'Trip status updated successfully.'
        );
    }

    /**
     * List staff for driver/attendant selection.
     */
    public function staff(Request $request)
    {
        $request->validate([
            'role' => 'sometimes|string|max:50',
        ]);

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




