<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Item;
use App\Models\PatientCheckIn;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use App\Models\PaymentChannel;
use App\Events\NotificationUpdate;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class PatientCheckInsController extends Controller
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
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $gender = $request->gender;
        $phone = $request->phone;
        $start_date = $request->start_date;
        $end_date = $request->end_date;

        // Default to today if no date filter is provided
        if (!$start_date && !$end_date) {
             $start_date = date('Y-m-d');
             $end_date = date('Y-m-d');
        }

        $data = PatientCheckIn::with(['patient' => function ($query) {
            $query->with(['region', 'district']);
        }, 'payment_mode', 'creator']);

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

        if ($patient_name) {
            $data->whereHas('patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->where('patient_id', $patient_id);
        }

        if ($gender) {
            $data->whereHas('patient', function ($query) use ($gender) {
                $query->where('gender', $gender);
            });
        }

        if ($phone) {
            $data->whereHas('patient', function ($query) use ($phone) {
                $query->where('phone', 'like', '%' . $phone . '%');
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
            'patient_id' => 'required|exists:patients,id',
            'payment_mode_id' => 'required|exists:payment_modes,id',
            'items' => 'required|array',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.consultant_id' => 'nullable|exists:users,id',
            'items.*.payment_mode_id' => 'required|exists:payment_modes,id',
            'items.*.quantity' => 'required|numeric|min:1',
            'mode' => 'nullable|string|in:checkin,invoice,bill',
        ]);

        $user = $request->user();
        $mode = $request->input('mode', 'checkin');
        $input = $request->only('patient_id', 'payment_mode_id');
        $input['created_by'] = $user->id;
        $data = PatientCheckIn::create($input);

        $createdCacheItems = [];

        if ($data) {
            $payment_cache = PatientPaymentCache::create([
                'check_in_id' => $data->id,
                'created_by' => $user->id,
            ]);

            if ($payment_cache) {
                $input_items = $request->input('items', []);

                foreach ($input_items as &$input_item) {
                    // if this item has price for the provided payment mode, continue
                    $item = Item::where('id', $input_item['item_id'])
                        ->whereHas('prices', function ($query) use ($input_item) {
                            $query->where('payment_mode_id', $input_item['payment_mode_id']);
                        })
                        ->with(['prices' => function ($query) use ($input_item) {
                            $query->where('payment_mode_id', $input_item['payment_mode_id']);
                        }])
                        ->first();

                    if ($item) {
                        $cacheItem = PatientPaymentCacheItem::create([
                            'payment_cache_id' => $payment_cache->id,
                            'item_id' => $item->id,
                            'consultation_type_id' => $item->consultation_type_id,
                            'consultant_id' => Arr::get($input_item, 'consultant_id'),
                            'payment_mode_id' => $input_item['payment_mode_id'],
                            'unit_price' => $item->prices[0]->unit_price,
                            'quantity' => $input_item['quantity'],
                            'comments' => Arr::get($input_item, 'comments'),
                            'created_by' => $user->id,
                        ]);
                        $createdCacheItems[] = $cacheItem;
                    }
                }
            }

            // When mode is 'invoice', create a PatientItemPayment and link items so the invoice appears in payment-center/invoices
            if ($mode === 'invoice' && count($createdCacheItems) > 0) {
                $channel = $this->getPaymentChannelForInvoice($user);
                if ($channel) {
                    $amount = 0;
                    foreach ($createdCacheItems as $cacheItem) {
                        $amount += ($cacheItem->unit_price ?? 0) * ($cacheItem->quantity ?? 0);
                    }
                    $payment = PatientItemPayment::create([
                        'channel_id' => $channel->id,
                        'amount' => $amount,
                        'discount' => 0,
                        'created_by' => $user->id,
                    ]);
                    if ($payment) {
                        foreach ($createdCacheItems as $cacheItem) {
                            $cacheItem->item_payment_id = $payment->id;
                            $cacheItem->save();
                        }
                    }
                }
            }
        }

        // Trigger notification refresh so cashier sees new patients immediately
        try {
            // Clear notification cache for all users in the same clinic
            if ($user->clinic_id) {
                // Get all users in the same clinic who have cashier privileges
                $cashierUsers = \App\Models\User::where('clinic_id', $user->clinic_id)
                    ->whereHas('privileges', function ($query) {
                        $query->where('payment_center', 1);
                    })
                    ->orWhere(function($q) use ($user) {
                        $q->where('clinic_id', $user->clinic_id)
                          ->whereIn('role', ['Cashier', 'Admin', 'Director', 'Finance Manager']);
                    })
                    ->get();
                
                foreach ($cashierUsers as $cashierUser) {
                    $cacheKey = "notifications_user_{$cashierUser->id}_clinic_" . ($cashierUser->clinic_id ?? 'null');
                    \Cache::forget($cacheKey);
                }
            } else {
                // If no clinic_id, clear cache for the current user only
                $cacheKey = "notifications_user_{$user->id}_clinic_" . ($user->clinic_id ?? 'null');
                \Cache::forget($cacheKey);
            }
            
            event(new NotificationUpdate());
            Log::info('Patient checked in - notification cache cleared and refresh triggered', [
                'check_in_id' => $data->id,
                'patient_id' => $data->patient_id,
                'payment_cache_id' => $payment_cache->id ?? null,
                'items_count' => count($createdCacheItems),
                'mode' => $mode,
                'user_clinic_id' => $user->clinic_id,
                'cashier_users_count' => isset($cashierUsers) ? $cashierUsers->count() : 1
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to trigger notification refresh after patient check-in', [
                'error' => $e->getMessage(),
                'check_in_id' => $data->id
            ]);
        }

        $message = $mode === 'invoice' ? 'Invoice created successfully.' : ($mode === 'bill' ? 'Bill created successfully.' : 'Checked in successfully.');
        return $this->sendResponse($data, Response::HTTP_OK, $message);
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PatientCheckIn::with(['patient', 'payment_mode', 'creator'])->findOrFail($id);
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
            'patient_id' => 'sometimes|exists:patients,id',
            'payment_mode_id' => 'sometimes|exists:payment_modes,id',
            'mode' => 'sometimes|in:cash,bill,invoice',
        ]);

        $data = PatientCheckIn::with(['patient', 'payment_mode', 'creator'])->findOrFail($id);
        $data->update($request->only('patient_id', 'payment_mode_id', 'mode'));

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
        $data = PatientCheckIn::findOrFail($id);

        if ($data->payment_cache()->whereHas('items', function ($q) {
            $q->whereIn('status', ['Paid', 'Served', 'Billed']);
        })->exists()) {
            return $this->sendError('Cannot delete a check-in that has paid, billed or served items.', Response::HTTP_CONFLICT);
        }

        $data->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Deleted successfully.');
    }

    /**
     * Get a payment channel for creating an invoice (e.g. at check-in).
     * Prefers "Cash" for the user's clinic; otherwise first active channel.
     *
     * @param \App\Models\User $user
     * @return \App\Models\PaymentChannel|null
     */
    protected function getPaymentChannelForInvoice($user)
    {
        $base = PaymentChannel::where('status', 'Active');
        $scoped = (clone $base);
        if ($user->clinic_id) {
            $scoped->where(function ($q) use ($user) {
                $q->where('clinic_id', $user->clinic_id)->orWhereNull('clinic_id');
            });
        }
        $cash = (clone $scoped)->where('name', 'Cash')->first();
        if ($cash) {
            return $cash;
        }
        return $scoped->first();
    }
}
