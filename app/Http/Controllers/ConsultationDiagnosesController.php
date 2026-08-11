<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\ConsultationDiagnosis;
use App\Models\Disease;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ConsultationDiagnosesController extends Controller
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
        ]);

        $per_page = $request->per_page ?? 25;
        $consultation_id = $request->consultation_id;
        $diagnosis_type = $request->diagnosis_type;
        $data = ConsultationDiagnosis::with(['disease', 'creator']);

        if ($consultation_id) {
            $data->where('consultation_id', $consultation_id);
        }

        if ($diagnosis_type) {
            $data->where('diagnosis_type', $diagnosis_type);
        }

        $data->orderBy('created_at', 'asc');
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
            'consultation_id' => 'required|exists:consultations,id',
            'disease_id' => 'required|exists:diseases,id',
            'diagnosis_type' => 'required|in:Preliminary,Final',
        ]);

        $input = $request->all();
        $input['created_by'] = $request->user()->id;
        $data = ConsultationDiagnosis::create($input);
        $data->disease = Disease::find($request->disease_id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Added successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = ConsultationDiagnosis::with(['disease', 'creator'])->findOrFail($id);
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
        $request->validate([
            'disease_id' => 'sometimes|exists:diseases,id',
            'diagnosis_type' => 'sometimes|in:Preliminary,Final',
        ]);

        $data = ConsultationDiagnosis::with(['disease', 'creator'])->findOrFail($id);
        $data->update($request->only('disease_id', 'diagnosis_type'));
        $data->load(['disease', 'creator']);
        return $this->sendResponse($data, Response::HTTP_OK, 'Updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $data = ConsultationDiagnosis::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
