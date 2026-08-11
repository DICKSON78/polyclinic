<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientItemPayment;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientItemPaymentsController extends Controller
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
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $payment_channel_id = $request->payment_channel_id;
        $with_patient = $request->with_patient;
        $with_items = $request->with_items;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $sort_direction = $request->sort_direction ?? 'asc';
        $data = PatientItemPayment::with(['channel', 'creator']);

        if ($user->is_admin) {
            $data->with(['creator.clinic']);

            if ($clinic_id) {
                $data->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
        } else {
            $data->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
        }

        if ($payment_channel_id) {
            $data->where('channel_id', $payment_channel_id);
        }

        if ($with_patient == 'Yes') {
            $data->with(['first_item'])->whereHas('first_item');
        }

        if ($with_items == 'Yes') {
            $data->with(['items' => function ($query) {
                $query->with([
                    'item.unit_of_measure', 
                    'payment_mode', 
                    'payment_cache.check_in.patient',
                    'creator'
                ]);
            }]);
        }

        if ($patient_name) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->whereHas('items.payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_gender) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        $data->orderBy('created_at', $sort_direction);
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
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
            $data = PatientItemPayment::with([
                'channel',
                'creator',
                'first_item.payment_cache.check_in.patient', // Ensure patient data is loaded
                'items' => function ($query) {
                    $query->with([
                        'item' => function ($itemQuery) {
                            $itemQuery->with('unit_of_measure');
                        },
                        'payment_mode',
                        'payment_cache.check_in.patient', // Ensure patient data is loaded for each item
                        'payment_cache.consultation',
                        'creator'
                    ]);
                }
            ])->find($id);

            if (!$data) {
                return $this->sendError('Invoice not found.', Response::HTTP_NOT_FOUND);
            }

            // Additional validation: ensure we have patient data
            $patientData = null;
            if ($data->first_item && $data->first_item->payment_cache && $data->first_item->payment_cache->check_in) {
                $patientData = $data->first_item->payment_cache->check_in->patient;
            }

            if (!$patientData && $data->items && $data->items->count() > 0) {
                // Try to get patient from first item
                $firstItem = $data->items->first();
                if ($firstItem && $firstItem->payment_cache && $firstItem->payment_cache->check_in) {
                    $patientData = $firstItem->payment_cache->check_in->patient;
                }
            }

            // If still no patient, try to get from any item
            if (!$patientData && $data->items && $data->items->count() > 0) {
                foreach ($data->items as $item) {
                    if ($item && $item->payment_cache && $item->payment_cache->check_in && $item->payment_cache->check_in->patient) {
                        $patientData = $item->payment_cache->check_in->patient;
                        break;
                    }
                }
            }

            if (!$patientData) {
                \Log::warning('Invoice missing patient data', [
                    'payment_id' => $id,
                    'items_count' => $data->items ? $data->items->count() : 0,
                    'first_item_exists' => $data->first_item ? true : false
                ]);
            }

            // Ensure all relationships are loaded for the response
            $data->loadMissing([
                'channel',
                'creator',
                'items.item.unit_of_measure',
                'items.payment_mode',
                'items.payment_cache.check_in.patient'
            ]);

            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Exception $e) {
            \Log::error('Error fetching invoice', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->sendError('Failed to load invoice. Please try again.', Response::HTTP_INTERNAL_SERVER_ERROR);
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
            'channel_id' => 'sometimes|exists:payment_channels,id',
            'amount' => 'sometimes|numeric|min:0',
            'discount' => 'sometimes|numeric|min:0',
        ]);

        $data = PatientItemPayment::with(['channel', 'creator', 'items.item.unit_of_measure'])->findOrFail($id);
        $data->update($request->only('channel_id', 'amount', 'discount'));
        $data->loadMissing([
            'channel',
            'creator',
            'items.item.unit_of_measure',
            'items.payment_mode',
            'items.payment_cache.check_in.patient'
        ]);
        return $this->sendResponse($data, Response::HTTP_OK, 'Payment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $data = PatientItemPayment::findOrFail($id);

        // Unlink paid items so they can be repaid, then remove the payment record
        $data->items()->update(['item_payment_id' => null]);

        $data->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Payment deleted successfully.');
    }
}
