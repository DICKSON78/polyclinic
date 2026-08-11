<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\PatientItemBill;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class PatientPaymentCacheItemsController extends Controller
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
            $request->validate([
                'per_page' => 'sometimes|integer|min:0',
                'page' => 'sometimes|integer|min:1',
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d',
                'sort_direction' => 'sometimes|in:asc,desc',
            ]);

            $user = $request->user();
            $per_page = $request->per_page ?? 25;
            $clinic_id = $request->clinic_id;
            $status = $request->status;
            $q = $request->q;
            $payment_cache_id = $request->payment_cache_id;
            $payment_mode_id = $request->payment_mode_id;
            $payment_type = $request->transaction_type ?? $request->payment_type;
            $consultation_type = $request->consultation_type;
            $is_stock_item = $request->is_stock_item;
            $consultant_id = $request->consultant_id;
            $consultation_id = $request->consultation_id;
            $bill_id = $request->bill_id;
            $with_patient = $request->with_patient;
            $patient_name = $request->patient_name;
            $patient_id = $request->patient_id;
            $patient_gender = $request->patient_gender;
            $patient_phone = $request->patient_phone;
            $start_date = $request->start_date;
            $end_date = $request->end_date;
            $sort_direction = $request->sort_direction ?? 'asc';

            $data = PatientPaymentCacheItem::with([
            'item' => function($query) {
                $query->select('id', 'name', 'code', 'templates', 'unit_of_measure_id', 'consultation_type_id', 'is_consultation_item', 'is_stock_item', 'balance', 'unit_buying_price', 'status');
            },
            'item.unit_of_measure', 
            'consultation_type', 
            'payment_mode', 
            'creator', 
            'server'
        ]);

        if ($user->is_admin) {
            $data->with(['creator.clinic']);

            if ($clinic_id) {
                $data->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
        } else {
            if ($user->clinic_id) {
                $data->whereHas('creator', function ($query) use ($user) {
                    $query->where('clinic_id', $user->clinic_id);
                });
            } else {
                // If user has no clinic_id, return empty result
                $data->whereRaw('1 = 0');
            }
        }

        if ($status) {
            $statuses = explode(',', $status);
            if (count($statuses) > 1) {
                $data->whereIn('status', $statuses);
            } else {
                $data->where('status', $statuses[0]);
            }
        }

        if ($q) {
            $data->whereHas('item', function ($query) use ($q) {
                $query->where('name', 'like', '%' . $q . '%');
                $query->orWhere('code', 'like', '%' . $q . '%');
            });
        }

        if ($payment_cache_id) {
            $data->where('payment_cache_id', $payment_cache_id);
        }

        if ($payment_mode_id) {
            $data->where('payment_mode_id', $payment_mode_id);
        }

        if ($payment_type) {
            $data->whereHas('payment_mode', function ($query) use ($payment_type) {
                $query->where('payment_type', $payment_type);
            });
        }

        if ($consultation_type) {
            $data->whereHas('consultation_type', function ($query) use ($consultation_type) {
                $query->where('name', $consultation_type);
            });
        }

        if ($is_stock_item) {
            $data->whereHas('item', function ($query) use ($is_stock_item) {
                $query->where('is_stock_item', $is_stock_item);
            });
        }

        if ($consultant_id) {
            $data->where('consultant_id', $consultant_id);
        }

        if ($consultation_id) {
            $data->whereHas('payment_cache', function ($query) use ($consultation_id) {
                $query->where('consultation_id', $consultation_id);
            });
        }

        if ($bill_id) {
            $data->where('bill_id', $bill_id);
        }

        if ($with_patient == 'Yes') {
            $data->with(['payment_cache.check_in.patient']);
        }

        if ($patient_name) {
            $data->whereHas('payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->whereHas('payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_gender) {
            $data->whereHas('payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($start_date) {
            if ($status) {
                $statuses = explode(',', $status);
                if (in_array('Served', $statuses)) {
                    $data->whereDate('served_at', '>=', $start_date);
                } else {
                    $data->whereDate('created_at', '>=', $start_date);
                }
            } else {
                $data->whereDate('created_at', '>=', $start_date);
            }
        }

        if ($end_date) {
            if ($status) {
                $statuses = explode(',', $status);
                if (in_array('Served', $statuses)) {
                    $data->whereDate('served_at', '<=', $end_date);
                } else {
                    $data->whereDate('created_at', '<=', $end_date);
                }
            } else {
                $data->whereDate('created_at', '<=', $end_date);
            }
        }

        $data->orderBy('created_at', $sort_direction);
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('PatientPaymentCacheItemsController index query error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->sendError('Database query error occurred', Response::HTTP_INTERNAL_SERVER_ERROR);
        } catch (\Exception $e) {
            \Log::error('PatientPaymentCacheItemsController index error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->sendError('An error occurred while fetching data', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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

    public function makeCashPayment(Request $request)
    {
        $request->validate([
            'payment_channel_id' => 'required|exists:payment_channels,id',
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
            'discount' => 'nullable|numeric|min:0',
        ]);

        $user = $request->user();
        $amount = 0;

        $payment = PatientItemPayment::create([
            'channel_id' => $request->payment_channel_id,
            'amount' => 0,
            'discount' => $request->discount ?? 0,
            'created_by' => $user->id,
        ]);

        if ($payment) {
            $items = $request->json('items');
            $consultation = null;
            $patient = null;
            $paymentCache = null;

            foreach ($items as &$request_item) {
                $item = PatientPaymentCacheItem::with(['item.consultation_type', 'item.item_type', 'payment_cache.check_in.patient'])
                    ->find($request_item);

                if ($item) {
                    $amount += ($item->unit_price * $item->quantity);

                    // Set item_payment_id for all items so they appear in the cash collection report.
                    // Dispensing requests use status='Paid' (not item_payment_id IS NULL) to find pending items.
                    $item->item_payment_id = $payment->id;
                    $item->status = 'Paid';
                    $item->save();

                    // Get payment cache and patient for later use
                    if (!$paymentCache) {
                        $paymentCache = $item->payment_cache;
                    }
                    if (!$patient && $paymentCache && $paymentCache->check_in) {
                        $patient = $paymentCache->check_in->patient;
                    }

                    // if item was not created from consultation, i.e. on check-in, create consultation
                    if (!$item->payment_cache->consultation_id) {
                        if ($item->item->is_consultation_item == 'Yes') {
                            $consultation = Consultation::create([
                                'payment_cache_item_id' => $item->id,
                                'created_by' => $user->id,
                            ]);
                            
                            $item->payment_cache->consultation_id = $consultation->id;
                            $item->payment_cache->save();
                        }
                    }
                }
            }

            $payment->amount = $amount;
            $payment->save();

            $payment->items = PatientPaymentCacheItem::with(['item.unit_of_measure'])
                ->where('item_payment_id', $payment->id)
                ->get();

            // Clear notification cache and trigger refresh for real-time updates
            try {
                $user = $request->user();
                $cacheKey = "notifications_user_{$user->id}_clinic_" . ($user->clinic_id ?? 'null');
                \Cache::forget($cacheKey);
                
                // Try to dispatch event, but don't fail if broadcasting fails
                try {
                    // Only dispatch if broadcasting is properly configured
                    if (config('broadcasting.default') !== 'null' && 
                        config('broadcasting.connections.pusher.key') && 
                        config('broadcasting.connections.pusher.secret')) {
                        event(new \App\Events\NotificationUpdate());
                    } else {
                        \Log::info('Broadcasting not configured, skipping NotificationUpdate event');
                    }
                } catch (\Exception $e) {
                    \Log::warning('Failed to broadcast NotificationUpdate event', [
                        'payment_id' => $payment->id,
                        'error' => $e->getMessage()
                    ]);
                    // Continue without broadcasting
                }
                
                \Log::info('Payment completed - notification cache cleared and refresh triggered', [
                    'payment_id' => $payment->id,
                    'amount' => $payment->amount,
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to clear notification cache and trigger refresh after payment', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage()
                ]);
            }

            return $this->sendResponse($payment, Response::HTTP_OK, 'Payment made successfully.');
        }

        return $this->sendResponse(
            null,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            'An error occurred. Payment could not be made.'
        );
    }

    public function approveCreditPayment(Request $request)
    {
        $request->validate([
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
        ]);

        $user = $request->user();
        $amount = 0;
        $items = $request->json('items');
        $consultation = null;
        $patient = null;
        $paymentCache = null;

        // Find or create Credit payment channel
        $creditChannel = \App\Models\PaymentChannel::where('name', 'Credit')->first();
        if (!$creditChannel) {
            // Try alternative names
            $creditChannel = \App\Models\PaymentChannel::whereIn('name', ['Credit', 'Credit Payment', 'Credit Payments'])->first();
            if (!$creditChannel) {
                // Create default Credit channel if it doesn't exist
                $creditChannel = \App\Models\PaymentChannel::create([
                    'name' => 'Credit',
                    'description' => 'Credit payments',
                    'status' => 'Active',
                    'clinic_id' => $user->clinic_id ?? null,
                ]);
            }
        }

        foreach ($items as &$request_item) {
            $item = PatientPaymentCacheItem::with(['item.consultation_type', 'item.item_type', 'payment_cache.check_in.patient'])
                ->find($request_item);

            if ($item) {
                $amount += ($item->unit_price * $item->quantity);

                $item->status = 'Paid';
                $item->save();

                // Get payment cache and patient for later use
                if (!$paymentCache) {
                    $paymentCache = $item->payment_cache;
                }
                if (!$patient && $paymentCache && $paymentCache->check_in) {
                    $patient = $paymentCache->check_in->patient;
                }

                // if item was not created from consultation, i.e. on check-in, create consultation
                if (!$item->payment_cache->consultation_id) {
                    if ($item->item->is_consultation_item == 'Yes') {
                        $consultation = Consultation::create([
                            'payment_cache_item_id' => $item->id,
                            'created_by' => $user->id,
                        ]);
                        
                        $item->payment_cache->consultation_id = $consultation->id;
                        $item->payment_cache->save();
                    }
                }
            }
        }

        // Create payment record for credit payment
        if ($amount > 0 && $creditChannel) {
            $payment = \App\Models\PatientItemPayment::create([
                'channel_id' => $creditChannel->id,
                'amount' => $amount,
                'discount' => 0,
                'created_by' => $user->id,
            ]);

            // Link items to the payment (except Pharmacy items which need to go to dispensing)
            foreach ($items as &$request_item) {
                $item = \App\Models\PatientPaymentCacheItem::with(['item.consultation_type'])
                    ->find($request_item);
                if ($item && $item->status === 'Paid') {
                    // Check if this is a pharmacy/medicine item
                    // Set item_payment_id for all items so they appear in the cash collection report.
                    // Dispensing requests use status='Paid' (not item_payment_id IS NULL) to find pending items.
                    $item->item_payment_id = $payment->id;
                    $item->save();
                }
            }

            \Log::info('Credit payment record created', [
                'payment_id' => $payment->id,
                'amount' => $amount,
                'items_count' => count($items),
                'user_id' => $user->id
            ]);
        }

        // Trigger notification refresh for real-time updates
        try {
            event(new \App\Events\NotificationUpdate());
            \Log::info('Credit payment approved - notification refresh triggered', [
                'items_count' => count($items),
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to trigger notification refresh after credit payment approval', [
                'error' => $e->getMessage()
            ]);
        }

        return $this->sendResponse($items, Response::HTTP_OK, 'Approved successfully.');
    }

    public function createInvoice(Request $request)
    {
        $request->validate([
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
            'discount' => 'nullable|numeric|min:0',
        ]);

        $user = $request->user();
        $amount = 0;
        $items = $request->json('items');
        
        // Find suitable payment channel
        $base = \App\Models\PaymentChannel::where('status', 'Active');
        $scoped = (clone $base);
        if ($user->clinic_id) {
            $scoped->where(function ($q) use ($user) {
                $q->where('clinic_id', $user->clinic_id)->orWhereNull('clinic_id');
            });
        }
        $selectedChannel = (clone $scoped)->where('name', 'Cash')->first();
        if (!$selectedChannel) {
            $selectedChannel = $scoped->first();
        }

        if (!$selectedChannel) {
             return $this->sendError('No active payment channel found.', Response::HTTP_BAD_REQUEST);
        }

        // Calculate amount and gather valid items
        $itemsToProcess = [];
        foreach ($items as $item_id) {
            $item = PatientPaymentCacheItem::find($item_id);
            if ($item && is_null($item->item_payment_id)) {
                $itemTotal = ($item->unit_price ?? 0) * ($item->quantity ?? 0);
                $amount += $itemTotal;
                $itemsToProcess[] = $item;
            }
        }

        if (empty($itemsToProcess)) {
            return $this->sendError('No eligible items found for invoicing.', Response::HTTP_BAD_REQUEST);
        }

        $payment = PatientItemPayment::create([
            'channel_id' => $selectedChannel->id,
            'amount' => $amount,
            'discount' => $request->discount ?? 0,
            'created_by' => $user->id,
        ]);

        if ($payment) {
            foreach ($itemsToProcess as $item) {
                $item->item_payment_id = $payment->id;
                // We keep the status as is (Pending) as it's not paid yet, but it is invoiced.
                // The filter in PatientPaymentCacheController checks for item_payment_id != null.
                $item->save();
            }

            return $this->sendResponse($payment, Response::HTTP_OK, 'Invoice created successfully.');
        }

        return $this->sendError('An error occurred while creating the invoice.', Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    public function createBill(Request $request)
    {
        $request->validate([
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
            'discount' => 'nullable|numeric|min:0',
        ]);

        $user = $request->user();
        $amount = 0;

        $bill = PatientItemBill::create([
            'amount' => 0,
            'discount' => $request->discount ?? 0,
            'created_by' => $user->id,
        ]);

        if ($bill) {
            $items = $request->json('items');

            foreach ($items as &$request_item) {
                $item = PatientPaymentCacheItem::find($request_item);

                if ($item) {
                    $amount += ($item->unit_price * $item->quantity);

                    $item->bill_id = $bill->id;
                    $item->status = 'Billed';
                    $item->save();

                    // if item was not created from consultation, i.e. on check-in, create consultation
                    if (!$item->payment_cache->consultation_id) {
                        if ($item->item->is_consultation_item == 'Yes') {
                            $consultation = Consultation::create([
                                'payment_cache_item_id' => $item->id,
                                'created_by' => $user->id,
                            ]);
                            
                            $item->payment_cache->consultation_id = $consultation->id;
                            $item->payment_cache->save();
                        }
                    }
                }
            }

            $bill->amount = $amount;
            $bill->save();

            // Clear notification cache and trigger refresh for real-time updates (especially for spectacle patients)
            try {
                $user = $request->user();
                $cacheKey = "notifications_user_{$user->id}_clinic_" . ($user->clinic_id ?? 'null');
                \Cache::forget($cacheKey);
                event(new \App\Events\NotificationUpdate());
                \Log::info('Bill created - notification cache cleared and refresh triggered', [
                    'bill_id' => $bill->id,
                    'items_count' => count($items)
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to clear notification cache and trigger refresh after bill creation', [
                    'error' => $e->getMessage()
                ]);
            }

            return $this->sendResponse($bill, Response::HTTP_OK, 'Bill created successfully.');
        }

        return $this->sendResponse(
            null,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            'An error occurred. Bill could not be created.'
        );
    }

    private function updateStatus(Request $request, $status, $message, $callback)
    {
        $request->validate([
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
        ]);

        $payment_cache = PatientPaymentCache::find($request->payment_cache_id);
        $data = [];
        $user = $request->user();
        $items = $request->json('items');

        $cacheItems = collect($items)->map(function ($id) {
            return PatientPaymentCacheItem::with(['item'])->find($id);
        })->filter();

        if ($status == 'Served') {
            $insufficient = $cacheItems
                ->filter(function ($item) {
                    return $item->item && $item->item->is_stock_item == 'Yes'
                        && $item->quantity > $item->item->balance;
                })
                ->map(function ($item) {
                    return $item->item->name . ' (requested ' . $item->quantity . ', available ' . $item->item->balance . ')';
                })
                ->values()
                ->all();

            if (!empty($insufficient)) {
                return $this->sendError(
                    'Cannot dispense. Insufficient stock for: ' . implode(', ', $insufficient),
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }
        }

        try {
            DB::transaction(function () use ($cacheItems, $status, $user, &$data) {
                foreach ($cacheItems as $item) {
                    $item->status = $status;

                    if ($status == 'Served') {
                        $item->served_by = $user->id;
                        $item->served_at = Carbon::now();

                        if ($item->item && $item->item->is_stock_item == 'Yes') {
                            $item->item->balance -= $item->quantity;
                            $item->item->save();
                        }
                    }

                    $item->save();
                    $data[] = $item;
                }
            });
        } catch (\Throwable $e) {
            \Log::error('PatientPaymentCacheItemsController@updateStatus failed', [
                'error' => $e->getMessage(),
                'status' => $status,
                'payment_cache_id' => $request->payment_cache_id,
            ]);
            return $this->sendError('Failed to update items. Please try again.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        if ($callback) {
            $callback($payment_cache);
        }

        // Clear notification cache and trigger refresh for real-time updates
        try {
            $user = $request->user();
            $cacheKey = "notifications_user_{$user->id}_clinic_" . ($user->clinic_id ?? 'null');
            Cache::forget($cacheKey);
            event(new \App\Events\NotificationUpdate());
            \Log::info('Cleared notification cache and triggered refresh after payment cache item update', [
                'user_id' => $user->id,
                'cache_key' => $cacheKey,
                'status' => $status,
                'payment_cache_id' => $request->payment_cache_id
            ]);
        } catch (\Exception $e) {
            \Log::warning('Failed to clear notification cache and trigger refresh after payment update', [
                'error' => $e->getMessage()
            ]);
        }

        return $this->sendResponse($data, Response::HTTP_OK, $message);
    }

    public function dispense(Request $request)
    {
        return $this->updateStatus($request, 'Served', 'Dispensed successfully.', function ($payment_cache) use ($request) {
            // Check if patient has unpaid items after dispensing
            $unpaidItems = PatientPaymentCacheItem::where('payment_cache_id', $payment_cache->id)
                ->whereIn('status', ['Pending', 'Billed'])
                ->count();
            
            if ($unpaidItems > 0) {
                \Log::info('Patient has unpaid items after dispensing - should go to cashier', [
                    'payment_cache_id' => $payment_cache->id,
                    'unpaid_items_count' => $unpaidItems
                ]);
                
                // Update patient waiting time to send them to cashier
                if ($payment_cache->check_in && $payment_cache->check_in->patient) {
                    $waitingTime = $payment_cache->check_in->patient->current_waiting_time;
                    if ($waitingTime) {
                        $waitingTime->sendToCashier();
                        \Log::info('Patient redirected to cashier after dispensing', [
                            'patient_id' => $payment_cache->check_in->patient->id,
                            'waiting_time_id' => $waitingTime->id
                        ]);
                    }
                }
            }
        });
    }

    public function complete(Request $request)
    {
        return $this->updateStatus($request, 'Served', 'Completed successfully.', null);
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PatientPaymentCacheItem::with([
            'payment_cache.check_in.patient',
            'item.unit_of_measure',
            'consultation_type',
            'payment_mode',
            'creator',
        ])
            ->findOrFail($id);
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
        $data = PatientPaymentCacheItem::findOrFail($id);
        $data->update($request->only('comments', 'dosage'));
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
        $data = PatientPaymentCacheItem::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
