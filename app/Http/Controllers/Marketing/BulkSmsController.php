<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\SmsCampaign;
use App\Models\SmsCampaignRecipient;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class BulkSmsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string',
            'type' => 'sometimes|string',
            'q' => 'sometimes|string',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;

        $data = SmsCampaign::with(['creator', 'recipients'])
            ->when($request->status, function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->type, function ($query) use ($request) {
                $query->where('type', $request->type);
            })
            ->when($request->q, function ($query) use ($request) {
                $query->where('title', 'like', '%' . $request->q . '%')
                      ->orWhere('message', 'like', '%' . $request->q . '%');
            })
            ->orderBy('created_at', 'desc')
            ->paginate($per_page);

        return $this->sendResponse($data, Response::HTTP_OK, 'SMS campaigns retrieved successfully.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:offer,announcement,reminder,other',
            'scheduled_at' => 'nullable|date',
            'recipient_filters' => 'nullable|array',
        ]);

        $user = $request->user();

        $campaign = SmsCampaign::create([
            'title' => $request->title,
            'message' => $request->message,
            'type' => $request->type,
            'status' => $request->scheduled_at ? 'scheduled' : 'draft',
            'scheduled_at' => $request->scheduled_at,
            'recipient_filters' => $request->recipient_filters,
            'created_by' => $user->id,
        ]);

        // Generate recipients based on filters
        $recipients = $this->generateRecipients($request->recipient_filters, $user);
        $campaign->total_recipients = count($recipients);
        $campaign->save();

        // Create recipient records
        foreach ($recipients as $recipient) {
            SmsCampaignRecipient::create([
                'sms_campaign_id' => $campaign->id,
                'patient_id' => $recipient['patient_id'] ?? null,
                'phone_number' => $recipient['phone'],
                'recipient_name' => $recipient['name'],
                'status' => 'pending',
            ]);
        }

        return $this->sendResponse($campaign->load('recipients'), Response::HTTP_CREATED, 'SMS campaign created successfully.');
    }

    public function show($id)
    {
        $campaign = SmsCampaign::with(['creator', 'recipients.patient'])->findOrFail($id);
        return $this->sendResponse($campaign, Response::HTTP_OK, 'SMS campaign retrieved successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'message' => 'sometimes|string',
            'type' => 'sometimes|in:offer,announcement,reminder,other',
            'status' => 'sometimes|in:draft,scheduled,sending,completed,failed',
            'scheduled_at' => 'nullable|date',
            'recipient_filters' => 'nullable|array',
        ]);

        $campaign = SmsCampaign::findOrFail($id);
        $user = $request->user();
        
        $updateData = $request->only(['title', 'message', 'type', 'status', 'scheduled_at']);
        
        // If recipient filters are updated, regenerate recipients
        if ($request->has('recipient_filters')) {
            $updateData['recipient_filters'] = $request->recipient_filters;
            
            // Only regenerate recipients if campaign is in draft status
            if ($campaign->status === 'draft') {
                // Delete existing recipients
                $campaign->recipients()->delete();
                
                // Generate new recipients based on updated filters
                $recipients = $this->generateRecipients($request->recipient_filters, $user);
                $updateData['total_recipients'] = count($recipients);
                
                // Create new recipient records
                foreach ($recipients as $recipient) {
                    SmsCampaignRecipient::create([
                        'sms_campaign_id' => $campaign->id,
                        'patient_id' => $recipient['patient_id'] ?? null,
                        'phone_number' => $recipient['phone'],
                        'recipient_name' => $recipient['name'],
                        'status' => 'pending',
                    ]);
                }
            }
        }
        
        $campaign->update($updateData);

        return $this->sendResponse($campaign->load('recipients'), Response::HTTP_OK, 'SMS campaign updated successfully.');
    }

    public function destroy($id)
    {
        $campaign = SmsCampaign::findOrFail($id);
        $campaign->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'SMS campaign deleted successfully.');
    }

    public function send(Request $request, $id)
    {
        $campaign = SmsCampaign::with('recipients')->findOrFail($id);

        if ($campaign->status === 'sending') {
            return $this->sendResponse(null, Response::HTTP_BAD_REQUEST, 'Campaign is already being sent.');
        }

        if ($campaign->status === 'completed') {
            return $this->sendResponse(null, Response::HTTP_BAD_REQUEST, 'Campaign has already been sent.');
        }

        $campaign->status = 'sending';
        $campaign->save();

        $mackSmsService = new \App\Http\Services\MackSmsService();
        $sentCount = 0;
        $failedCount = 0;

        // Prepare recipients for bulk SMS
        $recipients = [];
        foreach ($campaign->recipients as $recipient) {
            $recipients[] = [
                'phone' => $recipient->phone_number,
                'message' => $campaign->message
            ];
        }

        // Send SMS using MACKSMS API
        try {
            $result = $mackSmsService->sendMultipleSms($recipients);
            
            if ($result && isset($result['success']) && $result['success'] === true) {
                // Process successful response
                if (isset($result['sms_data']) && is_array($result['sms_data'])) {
                    foreach ($result['sms_data'] as $index => $smsData) {
                        if (isset($campaign->recipients[$index])) {
                            $recipient = $campaign->recipients[$index];
                            
                            if (isset($smsData['action_status']) && $smsData['action_status'] === true) {
                                $recipient->status = 'sent';
                                $recipient->sent_at = now();
                                $recipient->message_id = $smsData['messageID'] ?? null;
                                $recipient->api_response = json_encode($smsData);
                                $recipient->save();
                                $sentCount++;
                            } else {
                                $recipient->status = 'failed';
                                $recipient->error_message = $smsData['description'] ?? 'MACKSMS API error';
                                $recipient->api_response = json_encode($smsData);
                                $recipient->save();
                                $failedCount++;
                            }
                        }
                    }
                } else {
                    // If no sms_data array, mark all as failed
                    foreach ($campaign->recipients as $recipient) {
                        $recipient->status = 'failed';
                        $recipient->error_message = 'Invalid response format from MACKSMS API';
                        $recipient->api_response = json_encode($result);
                        $recipient->save();
                        $failedCount++;
                    }
                }
            } else {
                // Update all recipients as failed
                foreach ($campaign->recipients as $recipient) {
                    $recipient->status = 'failed';
                    $recipient->error_message = $result['description'] ?? 'MACKSMS API error';
                    $recipient->api_response = json_encode($result);
                    $recipient->save();
                    $failedCount++;
                }
            }
        } catch (\Exception $e) {
            // Update all recipients as failed
            foreach ($campaign->recipients as $recipient) {
                $recipient->status = 'failed';
                $recipient->error_message = $e->getMessage();
                $recipient->save();
                $failedCount++;
            }
        }

        $campaign->sent_count = $sentCount;
        $campaign->failed_count = $failedCount;
        $campaign->status = $failedCount === count($campaign->recipients) ? 'failed' : 'completed';
        $campaign->save();

        return $this->sendResponse($campaign->fresh()->load('recipients'), Response::HTTP_OK, "SMS campaign sent. {$sentCount} sent, {$failedCount} failed.");
    }

    /**
     * Get SMS balance
     */
    public function getBalance(Request $request)
    {
        $mackSmsService = new \App\Http\Services\MackSmsService();
        
        try {
            $result = $mackSmsService->getBalance();

            if ($result && isset($result['success']) && $result['success'] === true) {
                return $this->sendResponse($result, Response::HTTP_OK, 'SMS balance retrieved successfully.');
            } else {
                return $this->sendResponse(null, Response::HTTP_BAD_REQUEST, 'Failed to retrieve SMS balance.');
            }
        } catch (\Exception $e) {
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error: ' . $e->getMessage());
        }
    }

    private function generateRecipients($filters, $user)
    {
        $clinic_id = $user->is_admin ? null : $user->clinic_id;

        $query = Patient::query()
            ->when($clinic_id, function ($q) use ($clinic_id) {
                $q->whereHas('check_ins', function ($q2) use ($clinic_id) {
                    $q2->whereHas('creator', function ($q3) use ($clinic_id) {
                        $q3->where('clinic_id', $clinic_id);
                    });
                });
            })
            ->whereNotNull('phone')
            ->where('phone', '!=', '');

        if ($filters) {
            if (isset($filters['is_vip']) && $filters['is_vip']) {
                $query->where('is_vip', true);
            }
            if (isset($filters['is_businessperson']) && $filters['is_businessperson']) {
                $query->where('is_businessperson', true);
            }
            if (isset($filters['is_student']) && $filters['is_student']) {
                $query->where('is_student', true);
            }
            if (isset($filters['is_employee']) && $filters['is_employee']) {
                $query->where('is_employee', true);
            }
            if (isset($filters['is_outreach']) && $filters['is_outreach']) {
                $query->where('is_outreach', true);
            }
            if (isset($filters['min_payment']) && $filters['min_payment']) {
                $minPayment = $filters['min_payment'];
                // Filter patients by total payment amount
                $patientIds = DB::table('patient_item_payments')
                    ->join('patient_payment_cache_items', 'patient_item_payments.payment_cache_item_id', '=', 'patient_payment_cache_items.id')
                    ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                    ->join('patient_check_ins', 'patient_payment_cache.check_in_id', '=', 'patient_check_ins.id')
                    ->join('users', 'patient_item_payments.created_by', '=', 'users.id')
                    ->when($clinic_id, function ($q) use ($clinic_id) {
                        $q->where('users.clinic_id', $clinic_id);
                    })
                    ->groupBy('patient_check_ins.patient_id')
                    ->havingRaw('SUM(patient_item_payments.amount) >= ?', [$minPayment])
                    ->pluck('patient_check_ins.patient_id')
                    ->toArray();
                
                if (empty($patientIds)) {
                    return [];
                }
                
                $query->whereIn('id', $patientIds);
            }
        }

        $patients = $query->get(['id', 'first_name', 'middle_name', 'last_name', 'phone']);

        return $patients->map(function ($patient) {
            return [
                'patient_id' => $patient->id,
                'name' => $patient->full_name,
                'phone' => $patient->phone,
            ];
        })->toArray();
    }
}

