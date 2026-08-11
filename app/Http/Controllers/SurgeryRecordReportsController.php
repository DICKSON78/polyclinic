<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\SurgeryRecordReport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SurgeryRecordReportsController extends Controller
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
            'end_date' => 'sometimes|date_format:Y-m-d',
        ]);

        $per_page = $request->per_page ?? 25;
        $status = $request->status;
        $payment_cache_item_id = $request->payment_cache_item_id;
        $consultation_id = $request->consultation_id;
        $patient_id = $request->patient_id;
        $patient_name = $request->patient_name;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $item_payment_mode_id = $request->item_payment_mode_id;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = SurgeryRecordReport::with(['payment_cache_item' => function ($query) {
            $query->with(['payment_cache.check_in.patient' => function ($query2) {
                $query2->with(['region', 'district', 'ward']);
            }]);

            $query->with(['payment_mode', 'consultant']);
        }, 'creator']);

        if ($status) {
            $data->where('status', $status);
        }

        if ($payment_cache_item_id) {
            $data->where('payment_cache_item_id', $payment_cache_item_id);
        }

        if ($consultation_id) {
            $data->whereHas('payment_cache_item.payment_cache', function ($query) use ($consultation_id) {
                $query->where('consultation_id', $consultation_id);
            });
        }

        if ($patient_id) {
            $data->whereHas('payment_cache_item.payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_name) {
            $data->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_gender) {
            $data->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($item_payment_mode_id) {
            $data->whereHas('payment_cache_item', function ($query) use ($item_payment_mode_id) {
                $query->where('payment_mode_id', $item_payment_mode_id);
            });
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        $data->orderBy('created_at', 'desc');
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
        $request->validate([
            'payment_cache_item_id' => 'required|exists:patient_payment_cache_items,id',
            'status' => 'sometimes|required|in:Draft,Saved',
        ]);

        $data = SurgeryRecordReport::where('payment_cache_item_id', $request->payment_cache_item_id)->first();
        if ($data) {
            $input = $request->except('created_by');

            if ($data->status == 'Draft' && $request->status == 'Saved') {
                $input['status'] = 'Saved';
                $input['saved_at'] = Carbon::now();
                $input['saved_by'] = $request->user()->id;
            }

            $data->update($input);
        } else {
            $input = $request->except('status', 'saved_at', 'saved_by');
            $input['created_by'] = $request->user()->id;
            $data = SurgeryRecordReport::create($input);
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param Request $request
     * @param  int $id
     * @return Response
     */
    public function show(Request $request, $id)
    {
        $data = SurgeryRecordReport::with([
            'payment_cache_item' => function ($query) {
                $query->with(['payment_cache.check_in.patient' => function ($query2) {
                    $query2->with(['region', 'district', 'ward']);
                }]);

                $query->with(['payment_mode', 'consultant', 'server']);
            }, 'creator',
        ]);

        $data = $data->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
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
        $data = SurgeryRecordReport::with(['creator'])->findOrFail($id);

        $input = $request->except('payment_cache_item_id', 'created_by', 'status', 'saved_at', 'saved_by');

        if ($data->status == 'Draft' && $request->status == 'Saved') {
            $input['status'] = 'Saved';
            $input['saved_at'] = Carbon::now();
            $input['saved_by'] = $request->user()->id;
        }

        $data->update($input);

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
        $data = SurgeryRecordReport::findOrFail($id);

        if ($data->status == 'Saved') {
            return $this->sendError('Cannot delete a saved surgery record report.', Response::HTTP_CONFLICT);
        }

        $data->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Deleted successfully.');
    }
}
