<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Admission;
use App\Models\InpatientBill;
use App\Models\InpatientBillPayment;
use App\Models\InpatientCharge;
use App\Models\PaymentMode;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class InpatientBillingController extends Controller
{
    use ApiResponse;

    /**
     * Inpatient billing dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $chargeQuery = InpatientCharge::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id));

        $billQuery = InpatientBill::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id));

        $paymentQuery = InpatientBillPayment::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id));

        $pendingCharges = (clone $chargeQuery)->where('status', 'Pending')->sum('amount');

        $openBills = (clone $billQuery)->whereIn('status', ['Open', 'Partial'])->get();
        $openBillsTotal = $openBills->sum('total');
        $openBillsPaid = $openBills->sum(fn ($b) => $b->amount_paid);

        $summary = [
            'active_admissions' => Admission::where('status', 'Admitted')
                ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
                ->count(),
            'pending_charges' => (clone $chargeQuery)->where('status', 'Pending')->count(),
            'pending_amount' => round((float) $pendingCharges, 2),
            'open_bills' => (clone $billQuery)->whereIn('status', ['Open', 'Partial'])->count(),
            'open_bills_total' => round((float) $openBillsTotal, 2),
            'open_bills_balance' => round((float) ($openBillsTotal - $openBillsPaid), 2),
            'collected_today' => round((float) (clone $paymentQuery)
                ->whereDate('payment_date', now()->toDateString())
                ->sum('amount'), 2),
            'collected_month' => round((float) (clone $paymentQuery)
                ->whereMonth('payment_date', now()->month)
                ->whereYear('payment_date', now()->year)
                ->sum('amount'), 2),
        ];

        return $this->sendResponse($summary, Response::HTTP_OK, 'Inpatient billing dashboard retrieved successfully.');
    }

    /**
     * List inpatient charges.
     */
    public function accruals(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Pending,Billed,Void',
            'charge_type' => 'sometimes|in:Bed Day,Manual,Medication,Procedure',
            'admission_id' => 'sometimes|exists:admissions,id',
            'from' => 'sometimes|date',
            'to' => 'sometimes|date',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = InpatientCharge::with(['admission.ward', 'admission.bed', 'patient', 'chargedBy'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->charge_type, fn ($q, $s) => $q->where('charge_type', $s))
            ->when($request->admission_id, fn ($q, $s) => $q->where('admission_id', $s))
            ->when($request->from, fn ($q, $d) => $q->whereDate('charge_date', '>=', $d))
            ->when($request->to, fn ($q, $d) => $q->whereDate('charge_date', '<=', $d))
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('description', 'like', "%{$search}%")
                        ->orWhereHas('patient', function ($p) use ($search) {
                            $p->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('charge_date')
            ->orderByDesc('id')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Inpatient charges retrieved successfully.');
    }

    /**
     * Run bed-day accrual for all active admissions.
     */
    public function runAccrual(Request $request)
    {
        $request->validate([
            'as_of' => 'nullable|date',
        ]);

        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $asOf = $request->as_of ? Carbon::parse($request->as_of) : Carbon::today();

        $admissions = Admission::with('ward')
            ->where('status', 'Admitted')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->get();

        $created = 0;

        foreach ($admissions as $admission) {
            $pricePerDay = (float) ($admission->ward->price_per_day ?? 0);
            if ($pricePerDay <= 0) {
                continue;
            }

            $start = Carbon::parse($admission->admission_date)->startOfDay();
            $end = (clone $asOf)->startOfDay();

            for ($day = clone $start; $day->lte($end); $day->addDay()) {
                $exists = InpatientCharge::where('admission_id', $admission->id)
                    ->where('charge_type', 'Bed Day')
                    ->whereDate('charge_date', $day->toDateString())
                    ->exists();

                if ($exists) {
                    continue;
                }

                InpatientCharge::create([
                    'clinic_id' => $admission->clinic_id ?? $clinic_id,
                    'admission_id' => $admission->id,
                    'patient_id' => $admission->patient_id,
                    'charge_type' => 'Bed Day',
                    'description' => 'Bed day - ' . ($admission->ward->name ?? 'Ward'),
                    'charge_date' => $day->toDateString(),
                    'unit_price' => $pricePerDay,
                    'quantity' => 1,
                    'amount' => $pricePerDay,
                    'charged_by' => $user->id,
                    'status' => 'Pending',
                    'notes' => 'Auto-accrued',
                ]);

                $created++;
            }
        }

        return $this->sendResponse(
            ['created' => $created, 'as_of' => $asOf->toDateString()],
            Response::HTTP_OK,
            "Bed-day accrual complete. {$created} new charge(s) created."
        );
    }

    /**
     * Add a manual charge to an admission.
     */
    public function manualCharge(Request $request)
    {
        $request->validate([
            'admission_id' => 'required|exists:admissions,id',
            'charge_type' => 'nullable|in:Manual,Medication,Procedure',
            'description' => 'required|string|max:255',
            'unit_price' => 'required|numeric|min:0',
            'quantity' => 'nullable|numeric|min:0.01',
            'charge_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $admission = Admission::findOrFail($request->admission_id);
        $user = $request->user();

        $unitPrice = (float) $request->unit_price;
        $quantity = (float) ($request->quantity ?? 1);

        $item = InpatientCharge::create([
            'clinic_id' => $admission->clinic_id ?? $user->clinic_id,
            'admission_id' => $admission->id,
            'patient_id' => $admission->patient_id,
            'charge_type' => $request->charge_type ?? 'Manual',
            'description' => $request->description,
            'charge_date' => $request->charge_date ? Carbon::parse($request->charge_date) : Carbon::today(),
            'unit_price' => $unitPrice,
            'quantity' => $quantity,
            'amount' => round($unitPrice * $quantity, 2),
            'charged_by' => $user->id,
            'status' => 'Pending',
            'notes' => $request->notes,
        ]);

        return $this->sendResponse(
            $item->load(['admission.ward', 'patient', 'chargedBy']),
            Response::HTTP_CREATED,
            'Charge added successfully.'
        );
    }

    /**
     * Void a pending charge.
     */
    public function voidCharge(Request $request, $id)
    {
        $item = InpatientCharge::findOrFail($id);

        if ($item->status !== 'Pending') {
            return $this->sendError('Only pending charges can be voided.', Response::HTTP_CONFLICT);
        }

        $item->update([
            'status' => 'Void',
            'voided_at' => now(),
        ]);

        return $this->sendResponse($item, Response::HTTP_OK, 'Charge voided successfully.');
    }

    /**
     * List inpatient bills.
     */
    public function bills(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Open,Partial,Paid,Void',
            'admission_id' => 'sometimes|exists:admissions,id',
            'q' => 'sometimes|string|max:100',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = InpatientBill::with(['admission.ward', 'patient'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->admission_id, fn ($q, $s) => $q->where('admission_id', $s))
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('bill_no', 'like', "%{$search}%")
                        ->orWhereHas('patient', function ($p) use ($search) {
                            $p->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('created_at')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Inpatient bills retrieved successfully.');
    }

    /**
     * Create a bill from the pending charges of an admission.
     */
    public function createBill(Request $request)
    {
        $request->validate([
            'admission_id' => 'required|exists:admissions,id',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $admission = Admission::findOrFail($request->admission_id);
        $user = $request->user();

        $pendingCharges = InpatientCharge::where('admission_id', $admission->id)
            ->where('status', 'Pending')
            ->orderBy('charge_date')
            ->get();

        if ($pendingCharges->isEmpty()) {
            return $this->sendError('This admission has no pending charges to bill.', Response::HTTP_CONFLICT);
        }

        $amount = round((float) $pendingCharges->sum('amount'), 2);
        $discount = round((float) ($request->discount ?? 0), 2);
        if ($discount > $amount) {
            return $this->sendError('Discount cannot exceed the total amount.', Response::HTTP_CONFLICT);
        }
        $total = round($amount - $discount, 2);

        $billNo = 'IB-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $bill = DB::transaction(function () use ($request, $admission, $user, $pendingCharges, $amount, $discount, $total, $billNo) {
            $bill = InpatientBill::create([
                'bill_no' => $billNo,
                'clinic_id' => $admission->clinic_id ?? $user->clinic_id,
                'admission_id' => $admission->id,
                'patient_id' => $admission->patient_id,
                'amount' => $amount,
                'discount' => $discount,
                'total' => $total,
                'status' => 'Open',
                'issued_at' => now(),
                'issued_by' => $user->id,
                'notes' => $request->notes,
            ]);

            foreach ($pendingCharges as $charge) {
                $charge->update(['status' => 'Billed', 'billed_at_bill_id' => $bill->id]);
            }

            return $bill;
        });

        return $this->sendResponse(
            $bill->load(['admission.ward', 'patient', 'charges']),
            Response::HTTP_CREATED,
            'Bill created successfully.'
        );
    }

    /**
     * Show a single bill with charges and payments.
     */
    public function showBill(Request $request, $id)
    {
        $item = InpatientBill::with([
            'admission.ward', 'admission.bed', 'patient', 'issuedBy', 'settledBy',
            'charges' => fn ($q) => $q->where('status', 'Billed'),
            'payments.paymentMode', 'payments.recordedBy',
        ])->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'Inpatient bill retrieved successfully.');
    }

    /**
     * Record a payment against a bill.
     */
    public function addPayment(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_mode_id' => 'nullable|exists:payment_modes,id',
            'payment_date' => 'nullable|date',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $bill = InpatientBill::findOrFail($id);

        if (in_array($bill->status, ['Paid', 'Void'])) {
            return $this->sendError('Cannot add payments to a ' . strtolower($bill->status) . ' bill.', Response::HTTP_CONFLICT);
        }

        $user = $request->user();
        $amount = (float) $request->amount;

        $payment = DB::transaction(function () use ($request, $bill, $user, $amount) {
            $payment = InpatientBillPayment::create([
                'bill_id' => $bill->id,
                'clinic_id' => $bill->clinic_id ?? $user->clinic_id,
                'amount' => $amount,
                'payment_date' => $request->payment_date ? Carbon::parse($request->payment_date) : Carbon::today(),
                'payment_mode_id' => $request->payment_mode_id,
                'recorded_by' => $user->id,
                'reference' => $request->reference,
                'notes' => $request->notes,
            ]);

            $paid = round((float) $bill->payments()->sum('amount'), 2);
            $total = round((float) $bill->total, 2);

            if ($paid >= $total) {
                $bill->update([
                    'status' => 'Paid',
                    'settled_at' => now(),
                    'settled_by' => $user->id,
                ]);
            } else {
                $bill->update(['status' => 'Partial']);
            }

            return $payment;
        });

        return $this->sendResponse(
            $payment->load(['paymentMode', 'recordedBy']),
            Response::HTTP_CREATED,
            'Payment recorded successfully.'
        );
    }

    /**
     * List payment modes for the payment form.
     */
    public function paymentModes(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = PaymentMode::query()
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->where('status', 'Active')
            ->orderBy('name')
            ->get(['id', 'name']);

        return $this->sendResponse($items, Response::HTTP_OK, 'Payment modes retrieved successfully.');
    }
}
