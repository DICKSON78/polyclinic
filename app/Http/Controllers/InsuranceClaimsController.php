<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\InsuranceClaim;
use App\Models\InsuranceClaimItem;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class InsuranceClaimsController extends Controller
{
    use ApiResponse;

    protected function resolveClinicId(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->is_admin) {
            return $request->clinic_id;
        }

        return $user->clinic_id;
    }

    /**
     * Get the insurance claims dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
        ]);

        $clinic_id = $this->resolveClinicId($request);
        $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

        $query = InsuranceClaim::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->whereDate('service_date', '>=', $start_date)
            ->whereDate('service_date', '<=', $end_date);

        $counts = (clone $query)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $summary = [
            'draft' => (int) ($counts['Draft'] ?? 0),
            'submitted' => (int) ($counts['Submitted'] ?? 0),
            'approved' => (int) ($counts['Approved'] ?? 0),
            'rejected' => (int) ($counts['Rejected'] ?? 0),
            'paid' => (int) ($counts['Paid'] ?? 0),
            'total' => (int) $counts->sum(),
            'claim_amount' => (float) (clone $query)->sum('claim_amount'),
            'approved_amount' => (float) (clone $query)->whereNotNull('approved_amount')->sum('approved_amount'),
            'paid_amount' => (float) (clone $query)->where('status', 'Paid')->sum('paid_amount'),
            'date' => Carbon::today()->toDateString(),
        ];

        return $this->sendResponse($summary, Response::HTTP_OK, 'Insurance claims dashboard retrieved successfully.');
    }

    /**
     * List insurance claims.
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Draft,Submitted,Approved,Rejected,Paid',
            'insurance_company_id' => 'sometimes|exists:insurance_companies,id',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
            'q' => 'sometimes|string|max:100',
        ]);

        $clinic_id = $this->resolveClinicId($request);

        $data = InsuranceClaim::with(['patient', 'insurance_company'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->insurance_company_id, fn ($q, $company) => $q->where('insurance_company_id', $company))
            ->when($request->start_date, fn ($q, $date) => $q->whereDate('service_date', '>=', $date))
            ->when($request->end_date, fn ($q, $date) => $q->whereDate('service_date', '<=', $date))
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('claim_no', 'like', "%{$search}%")
                        ->orWhereHas('patient', function ($patient) use ($search) {
                            $patient->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('service_date')
            ->paginate($request->get('per_page', 25));

        return $this->sendResponse($data, Response::HTTP_OK, 'Insurance claims retrieved successfully.');
    }

    /**
     * Get a single claim.
     */
    public function show($id)
    {
        $item = InsuranceClaim::with([
            'patient', 'insurance_company', 'check_in', 'consultation',
            'items.payment_cache_item',
            'creator', 'submittedBy', 'approvedBy', 'paidBy',
        ])->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'Claim retrieved successfully.');
    }

    /**
     * Create a claim from selected billed items.
     */
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'insurance_company_id' => 'required|exists:insurance_companies,id',
            'check_in_id' => 'nullable|exists:patient_check_ins,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'service_date' => 'required|date',
            'payment_cache_item_ids' => 'required|array|min:1',
            'payment_cache_item_ids.*' => 'required|integer',
        ]);

        $user = $request->user();
        $itemIds = array_values(array_unique($request->payment_cache_item_ids));

        $paymentItems = PatientPaymentCacheItem::with(['item'])
            ->whereIn('id', $itemIds)
            ->get();

        $missing = array_diff($itemIds, $paymentItems->pluck('id')->all());
        if (!empty($missing)) {
            return $this->sendError('Some billed items do not exist: ' . implode(', ', $missing), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Prevent the same billed item being claimed more than once.
        $alreadyClaimed = InsuranceClaimItem::with(['claim'])
            ->whereIn('payment_cache_item_id', $itemIds)
            ->get();

        if ($alreadyClaimed->isNotEmpty()) {
            $details = $alreadyClaimed
                ->map(fn ($item) => ($item->item_name ?? 'item') . ' (claim ' . $item->claim->claim_no . ')')
                ->unique()
                ->values()
                ->all();

            return $this->sendError(
                'Some items are already on another claim: ' . implode(', ', $details),
                Response::HTTP_CONFLICT
            );
        }

        $claimNo = 'CLM-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $claim = DB::transaction(function () use ($request, $user, $paymentItems, $claimNo) {
            $claim = InsuranceClaim::create([
                'claim_no' => $claimNo,
                'clinic_id' => $this->resolveClinicId($request),
                'insurance_company_id' => $request->insurance_company_id,
                'patient_id' => $request->patient_id,
                'check_in_id' => $request->check_in_id,
                'consultation_id' => $request->consultation_id,
                'service_date' => $request->service_date,
                'status' => 'Draft',
                'claim_amount' => 0,
                'created_by' => $user->id,
            ]);

            $amount = 0;
            foreach ($paymentItems as $paymentItem) {
                $lineAmount = (float) $paymentItem->unit_price * (float) $paymentItem->quantity;
                $amount += $lineAmount;

                InsuranceClaimItem::create([
                    'insurance_claim_id' => $claim->id,
                    'payment_cache_item_id' => $paymentItem->id,
                    'item_id' => $paymentItem->item_id,
                    'item_name' => $paymentItem->item->name ?? $paymentItem->comments,
                    'quantity' => $paymentItem->quantity,
                    'unit_price' => $paymentItem->unit_price,
                    'amount' => $lineAmount,
                ]);
            }

            $claim->update(['claim_amount' => $amount]);

            try {
                cache()->flush();
                event(new \App\Events\NotificationUpdate());
            } catch (\Exception $e) {
                \Log::warning('Failed to trigger notification refresh after creating insurance claim', [
                    'claim_id' => $claim->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return $claim;
        });

        return $this->sendResponse(
            $claim->load(['patient', 'insurance_company', 'items']),
            Response::HTTP_CREATED,
            'Claim created successfully.'
        );
    }

    /**
     * Submit a claim to the insurer.
     */
    public function submit(Request $request, $id)
    {
        $claim = InsuranceClaim::findOrFail($id);

        if ($claim->status !== 'Draft') {
            return $this->sendError('Only draft claims can be submitted. Current status: ' . $claim->status, Response::HTTP_CONFLICT);
        }

        $claim->status = 'Submitted';
        $claim->submitted_date = Carbon::today();
        $claim->submitted_at = now();
        $claim->submitted_by = $request->user()->id;
        $claim->save();

        $this->refreshDashboards('submitting insurance claim', $claim->id);

        return $this->sendResponse($claim->load(['items']), Response::HTTP_OK, 'Claim submitted successfully.');
    }

    /**
     * Approve a submitted claim.
     */
    public function approve(Request $request, $id)
    {
        $request->validate([
            'approved_amount' => 'nullable|numeric|min:0',
        ]);

        $claim = InsuranceClaim::findOrFail($id);

        if ($claim->status !== 'Submitted') {
            return $this->sendError('Only submitted claims can be approved. Current status: ' . $claim->status, Response::HTTP_CONFLICT);
        }

        $claim->status = 'Approved';
        $claim->approved_amount = $request->approved_amount ?? $claim->claim_amount;
        $claim->approved_at = now();
        $claim->approved_by = $request->user()->id;
        $claim->save();

        $this->refreshDashboards('approving insurance claim', $claim->id);

        return $this->sendResponse($claim->load(['items']), Response::HTTP_OK, 'Claim approved successfully.');
    }

    /**
     * Reject a submitted claim.
     */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'reject_reason' => 'required|string|max:1000',
        ]);

        $claim = InsuranceClaim::findOrFail($id);

        if ($claim->status !== 'Submitted') {
            return $this->sendError('Only submitted claims can be rejected. Current status: ' . $claim->status, Response::HTTP_CONFLICT);
        }

        $claim->status = 'Rejected';
        $claim->reject_reason = $request->reject_reason;
        $claim->approved_at = now();
        $claim->approved_by = $request->user()->id;
        $claim->save();

        $this->refreshDashboards('rejecting insurance claim', $claim->id);

        return $this->sendResponse($claim->load(['items']), Response::HTTP_OK, 'Claim rejected successfully.');
    }

    /**
     * Record payment received for an approved claim.
     */
    public function pay(Request $request, $id)
    {
        $request->validate([
            'paid_amount' => 'nullable|numeric|min:0',
        ]);

        $claim = InsuranceClaim::findOrFail($id);

        if ($claim->status !== 'Approved') {
            return $this->sendError('Only approved claims can be paid. Current status: ' . $claim->status, Response::HTTP_CONFLICT);
        }

        $claim->status = 'Paid';
        $claim->paid_amount = $request->paid_amount ?? $claim->approved_amount;
        $claim->paid_at = now();
        $claim->paid_by = $request->user()->id;
        $claim->save();

        $this->refreshDashboards('recording insurance claim payment', $claim->id);

        return $this->sendResponse($claim->load(['items']), Response::HTTP_OK, 'Claim payment recorded successfully.');
    }

    /**
     * Get claim history for a patient.
     */
    public function patientHistory(Request $request, $patientId)
    {
        $data = InsuranceClaim::with(['insurance_company', 'items'])
            ->where('patient_id', $patientId)
            ->orderByDesc('service_date')
            ->paginate($request->get('per_page', 20));

        return $this->sendResponse($data, Response::HTTP_OK, 'Patient claims history retrieved successfully.');
    }

    protected function refreshDashboards($action, $claimId)
    {
        try {
            cache()->flush();
            event(new \App\Events\NotificationUpdate());
        } catch (\Exception $e) {
            \Log::warning('Failed to trigger notification refresh after ' . $action, [
                'claim_id' => $claimId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
