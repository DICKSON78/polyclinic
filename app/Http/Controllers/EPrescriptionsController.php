<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\ConsultationType;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class EPrescriptionsController extends Controller
{
    use ApiResponse;

    /**
     * List active medicines for prescription selection.
     */
    public function medicines(Request $request)
    {
        $user = $request->user();

        $items = \App\Models\Medicine::query()
            ->where('clinic_id', $user->clinic_id)
            ->where('status', 'Active')
            ->whereHas('item_type', fn ($q) => $q->whereIn('name', ['Medicine', 'Pharmaceutical']))
            ->with('unit_of_measure')
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate($request->get('per_page', 200));

        return $this->sendResponse($items, Response::HTTP_OK, 'Medicines retrieved successfully.');
    }

    /**
     * Get the e-prescription dashboard summary.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $today = Carbon::today();

        $active = Prescription::where('status', 'Active')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $partiallyDispensed = Prescription::where('status', 'Partially Dispensed')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $dispensedToday = Prescription::whereIn('status', ['Dispensed', 'Partially Dispensed'])
            ->whereDate('updated_at', $today)
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $cancelled = Prescription::where('status', 'Cancelled')
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $prescriptionsToday = Prescription::whereDate('date_prescribed', $today)
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->count();

        $itemsPending = PrescriptionItem::where('status', 'Pending')
            ->whereHas('prescription', fn ($q) => $q->whereIn('status', ['Active', 'Partially Dispensed']))
            ->when($clinic_id, fn ($q) => $q->whereHas('prescription', fn ($p) => $p->where('clinic_id', $clinic_id)))
            ->count();

        return $this->sendResponse([
            'active_prescriptions' => (int) $active,
            'partially_dispensed' => (int) $partiallyDispensed,
            'dispensed_today' => (int) $dispensedToday,
            'cancelled' => (int) $cancelled,
            'prescriptions_today' => (int) $prescriptionsToday,
            'items_pending' => (int) $itemsPending,
            'date' => $today->toDateString(),
        ], Response::HTTP_OK, 'E-prescription dashboard retrieved successfully.');
    }

    /**
     * List prescriptions.
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string',
            'q' => 'sometimes|string|max:100',
            'date' => 'sometimes|date',
        ]);

        $per_page = $request->per_page ?? 25;
        $user = $request->user();
        $clinic_id = $user->clinic_id;

        $items = Prescription::with(['patient', 'prescribedBy', 'items'])
            ->when($clinic_id, fn ($q) => $q->where('clinic_id', $clinic_id))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->date, fn ($q, $date) => $q->whereDate('date_prescribed', $date))
            ->when($request->q, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('prescription_no', 'like', "%{$search}%")
                        ->orWhere('diagnosis', 'like', "%{$search}%")
                        ->orWhereHas('patient', function ($patient) use ($search) {
                            $patient->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('date_prescribed')
            ->paginate($per_page);

        return $this->sendResponse($items, Response::HTTP_OK, 'Prescriptions retrieved successfully.');
    }

    /**
     * Get a single prescription.
     */
    public function show(Request $request, $id)
    {
        $item = Prescription::with([
            'patient', 'prescribedBy', 'cancelledBy', 'consultation',
            'items.medicine',
            'items.dispensedBy',
            'bill_items.item.unit_of_measure',
            'bill_items.payment_mode',
        ])->findOrFail($id);

        return $this->sendResponse($item, Response::HTTP_OK, 'Prescription retrieved successfully.');
    }

    /**
     * Create a new prescription.
     */
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'diagnosis' => 'nullable|string|max:255',
            'clinical_notes' => 'nullable|string',
            'expires_at' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:items,id',
            'items.*.dosage' => 'nullable|string|max:100',
            'items.*.frequency' => 'nullable|string|max:100',
            'items.*.duration' => 'nullable|string|max:50',
            'items.*.quantity' => 'nullable|numeric|min:0',
            'items.*.unit' => 'nullable|string|max:50',
            'items.*.meal' => 'nullable|in:None,Before,After',
            'items.*.instructions' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        $prescriptionNo = 'RX-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        $item = DB::transaction(function () use ($request, $user, $prescriptionNo) {
            $prescription = Prescription::create([
                'prescription_no' => $prescriptionNo,
                'clinic_id' => $user->clinic_id,
                'patient_id' => $request->patient_id,
                'consultation_id' => $request->consultation_id,
                'prescribed_by' => $user->id,
                'date_prescribed' => now(),
                'diagnosis' => $request->diagnosis,
                'clinical_notes' => $request->clinical_notes,
                'status' => 'Active',
                'expires_at' => $request->expires_at,
            ]);

            foreach ($request->items as $itemData) {
                $medicine = \App\Models\Medicine::find($itemData['medicine_id']);
                PrescriptionItem::create([
                    'prescription_id' => $prescription->id,
                    'medicine_id' => $itemData['medicine_id'],
                    'medicine_name' => $medicine->name ?? null,
                    'dosage' => $itemData['dosage'] ?? null,
                    'frequency' => $itemData['frequency'] ?? null,
                    'duration' => $itemData['duration'] ?? null,
                    'duration_unit' => 'days',
                    'quantity' => $itemData['quantity'] ?? 0,
                    'unit' => $itemData['unit'] ?? ($medicine->unit_of_measure->name ?? null),
                    'meal' => $itemData['meal'] ?? 'None',
                    'instructions' => $itemData['instructions'] ?? null,
                    'status' => 'Pending',
                ]);
            }

            return $prescription;
        });

        return $this->sendResponse($item->load(['patient', 'items']), Response::HTTP_CREATED, 'Prescription created successfully.');
    }

    /**
     * Send a prescription to the pharmacy, generating billable items so it
     * appears in the payment center and medicine center for billing/dispensing.
     */
    public function sendToPharmacy(Request $request, $id)
    {
        $request->validate([
            'payment_mode_id' => 'required|exists:payment_modes,id',
        ]);

        $user = $request->user();

        $prescription = Prescription::with([
            'items.medicine.unit_of_measure',
            'consultation.payment_cache_item.payment_cache',
        ])->findOrFail($id);

        if (in_array($prescription->status, ['Cancelled', 'Expired'])) {
            return $this->sendError(
                'Cannot send a ' . strtolower($prescription->status) . ' prescription to the pharmacy.',
                Response::HTTP_CONFLICT
            );
        }

        $pharmacyTypeId = ConsultationType::where('name', 'Pharmacy')->value('id');

        try {
            $result = DB::transaction(function () use ($request, $user, $prescription, $pharmacyTypeId) {
                // Reuse the consultation's payment cache when available so all
                // of the consultation's items are billed together.
                $paymentCache = PatientPaymentCache::where('consultation_id', $prescription->consultation_id)->first();

                if (!$paymentCache) {
                    $checkInId = $prescription->consultation && $prescription->consultation->payment_cache_item
                        ? $prescription->consultation->payment_cache_item->payment_cache->check_in_id
                        : $prescription->patient->check_ins()->latest('id')->value('id');

                    if (!$checkInId) {
                        throw new \Exception('No check-in found for this patient. Check the patient in before sending the prescription to the pharmacy.');
                    }

                    $paymentCache = PatientPaymentCache::create([
                        'check_in_id' => $checkInId,
                        'consultation_id' => $prescription->consultation_id,
                        'created_by' => $user->id,
                    ]);
                }

                if (!$pharmacyTypeId) {
                    throw new \Exception('The Pharmacy consultation type is not configured.');
                }

                $created = [];
                $skipped = [];

                foreach ($prescription->items as $prescriptionItem) {
                    if ($prescriptionItem->status !== 'Pending') {
                        continue;
                    }

                    if ((float) $prescriptionItem->quantity <= 0) {
                        $skipped[] = $prescriptionItem->medicine_name . ' (no quantity)';
                        continue;
                    }

                    if (PatientPaymentCacheItem::where('prescription_item_id', $prescriptionItem->id)->exists()) {
                        $skipped[] = $prescriptionItem->medicine_name . ' (already sent)';
                        continue;
                    }

                    $medicine = $prescriptionItem->medicine;
                    if (!$medicine) {
                        $skipped[] = $prescriptionItem->medicine_name . ' (medicine not found)';
                        continue;
                    }

                    $itemPrice = $medicine->prices()->where('payment_mode_id', $request->payment_mode_id)->value('unit_price');
                    $unitPrice = $itemPrice ?? $medicine->selling_price;

                    if ($unitPrice === null) {
                        $skipped[] = $medicine->name . ' (no price set for the selected payment mode)';
                        continue;
                    }

                    $cacheItem = PatientPaymentCacheItem::create([
                        'payment_cache_id' => $paymentCache->id,
                        'item_id' => $medicine->id,
                        'prescription_id' => $prescription->id,
                        'prescription_item_id' => $prescriptionItem->id,
                        'consultation_type_id' => $medicine->consultation_type_id ?: $pharmacyTypeId,
                        'consultant_id' => $prescription->prescribed_by,
                        'payment_mode_id' => $request->payment_mode_id,
                        'unit_price' => $unitPrice,
                        'quantity' => $prescriptionItem->quantity,
                        'dosage' => $prescriptionItem->dosage,
                        'comments' => $prescriptionItem->instructions,
                        'created_by' => $user->id,
                        'status' => 'Pending',
                    ]);

                    $created[] = $cacheItem->load(['item', 'medicine', 'payment_mode', 'consultation_type']);
                }

                // Trigger notification refresh so payment/dispensing dashboards update immediately
                try {
                    cache()->flush();
                    event(new \App\Events\NotificationUpdate());
                } catch (\Exception $e) {
                    \Log::warning('Failed to trigger notification refresh after sending prescription to pharmacy', [
                        'prescription_id' => $prescription->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                return [
                    'created' => $created,
                    'skipped' => $skipped,
                    'payment_cache_id' => $paymentCache->id,
                ];
            });
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (empty($result['created'])) {
            $detail = count($result['skipped']) ? implode('; ', $result['skipped']) : 'All items have already been billed.';
            return $this->sendResponse($result, Response::HTTP_OK, 'No new items were sent to the pharmacy. ' . $detail);
        }

        return $this->sendResponse($result, Response::HTTP_CREATED, 'Prescription sent to pharmacy successfully.');
    }

    /**
     * Dispense one or more items on a prescription.
     */
    public function dispense(Request $request, $id)
    {
        $item = Prescription::with('items')->findOrFail($id);

        if (in_array($item->status, ['Cancelled', 'Expired'])) {
            return $this->sendError('Cannot dispense a ' . strtolower($item->status) . ' prescription.', Response::HTTP_CONFLICT);
        }

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:prescription_items,id',
            'items.*.dispensed_qty' => 'required|numeric|min:0',
        ]);

        $user = $request->user();

        $insufficient = [];
        foreach ($request->items as $data) {
            $prescriptionItem = $item->items()->with('medicine')->findOrFail($data['id']);
            $medicine = $prescriptionItem->medicine;
            if ($medicine && $data['dispensed_qty'] > $medicine->balance) {
                $insufficient[] = $medicine->name . ' (requested ' . $data['dispensed_qty'] . ', available ' . $medicine->balance . ')';
            }
        }

        if (!empty($insufficient)) {
            return $this->sendError(
                'Cannot dispense. Insufficient stock for: ' . implode(', ', $insufficient),
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        DB::transaction(function () use ($request, $item, $user) {
            foreach ($request->items as $data) {
                $prescriptionItem = $item->items()->with('medicine')->findOrFail($data['id']);

                $currentDispensed = (float) $prescriptionItem->dispensed_qty;
                $totalQty = (float) $prescriptionItem->quantity;
                $newQty = min($currentDispensed + (float) $data['dispensed_qty'], $totalQty);
                $newQty = max(0, $newQty);

                $medicine = $prescriptionItem->medicine;
                if ($medicine) {
                    $locked = \App\Models\Medicine::where('id', $medicine->id)->lockForUpdate()->first();
                    $locked->balance -= (float) $data['dispensed_qty'];
                    $locked->save();
                }

                $prescriptionItem->dispensed_qty = $newQty;
                $prescriptionItem->status = $newQty >= $totalQty && $totalQty > 0
                    ? 'Dispensed'
                    : ($newQty > 0 ? 'Partially Dispensed' : 'Pending');
                $prescriptionItem->dispensed_at = $newQty > 0 ? now() : $prescriptionItem->dispensed_at;
                $prescriptionItem->dispensed_by = $newQty > 0 ? $user->id : $prescriptionItem->dispensed_by;
                $prescriptionItem->save();
            }

            $allDispensed = $item->items()->where('status', '!=', 'Dispensed')->count() === 0;
            $anyDispensed = $item->items()->whereIn('status', ['Dispensed', 'Partially Dispensed'])->count() > 0;

            if ($allDispensed) {
                $item->status = 'Dispensed';
            } elseif ($anyDispensed) {
                $item->status = 'Partially Dispensed';
            }
            $item->save();
        });

        return $this->sendResponse($item->load(['items']), Response::HTTP_OK, 'Prescription items dispensed successfully.');
    }

    /**
     * Cancel a prescription.
     */
    public function cancel(Request $request, $id)
    {
        $request->validate([
            'cancel_reason' => 'required|string|max:500',
        ]);

        $item = Prescription::findOrFail($id);

        if (in_array($item->status, ['Cancelled', 'Expired', 'Dispensed', 'Partially Dispensed'])) {
            return $this->sendError('Cannot cancel this prescription because it is already ' . strtolower($item->status) . '.', Response::HTTP_CONFLICT);
        }

        $item->status = 'Cancelled';
        $item->cancel_reason = $request->cancel_reason;
        $item->cancelled_by = $request->user()->id;
        $item->cancelled_at = now();
        $item->save();

        // Remove any pending billing items generated from this prescription so
        // the patient is not charged. Paid/Billed items are left untouched.
        $voided = DB::table('patient_payment_cache_items')
            ->where('prescription_id', $item->id)
            ->where('status', 'Pending')
            ->delete();

        try {
            cache()->flush();
            event(new \App\Events\NotificationUpdate());
        } catch (\Exception $e) {
            \Log::warning('Failed to trigger notification refresh after cancelling prescription', [
                'prescription_id' => $item->id,
                'error' => $e->getMessage(),
            ]);
        }

        if ($voided > 0) {
            \Log::info('Cancelled prescription removed pending billing items', [
                'prescription_id' => $item->id,
                'items_voided' => $voided,
            ]);
        }

        return $this->sendResponse($item, Response::HTTP_OK, 'Prescription cancelled successfully.');
    }

    /**
     * Get prescription history for a patient.
     */
    public function patientHistory(Request $request, $patientId)
    {
        $items = Prescription::with(['prescribedBy', 'items'])
            ->where('patient_id', $patientId)
            ->orderByDesc('date_prescribed')
            ->paginate($request->get('per_page', 20));

        return $this->sendResponse($items, Response::HTTP_OK, 'Prescription history retrieved successfully.');
    }
}
