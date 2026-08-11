<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Http\Services\EmailService;
use App\Models\Appointment;
use App\Events\NotificationUpdate;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ExternalLinksWebsiteAppointmentsController extends Controller
{
    use ApiResponse;

    /**
     * Get website appointments
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:Pending,Approved,Rejected,Completed,Cancelled',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;

        $query = Appointment::with(['repliedBy']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->start_date) {
            $query->whereDate('preferred_date', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $query->whereDate('preferred_date', '<=', $request->end_date);
        }

        $appointments = $query->orderBy('created_at', 'desc')
            ->paginate($per_page);

        return $this->sendResponse($appointments, Response::HTTP_OK, 'Website appointments retrieved successfully.');
    }

    /**
     * Update appointment status
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Pending,Approved,Rejected,Completed,Cancelled',
        ]);

        $appointment = Appointment::findOrFail($id);
        $oldStatus = $appointment->status;
        
        $appointment->update([
            'status' => $request->status,
        ]);

        $appointment->load(['repliedBy']);

        // Send email notification to patient if status changed and appointment notifications are enabled
        if ($oldStatus !== $request->status && !empty($appointment->email)) {
            $this->sendAppointmentStatusEmail($appointment, $request->status);
        }

        // Clear notification cache and broadcast updates so dashboards reflect changes
        Cache::flush();
        event(new NotificationUpdate());

        return $this->sendResponse($appointment, Response::HTTP_OK, 'Appointment status updated successfully.');
    }

    /**
     * Send appointment status email to patient
     */
    private function sendAppointmentStatusEmail($appointment, $newStatus)
    {
        try {
            // Resolve clinic from available clinics (appointments are clinic-global)
            $clinic_id = \App\Models\Clinic::orderBy('id')->value('id') ?? 1;

            // Check if appointment notifications are enabled
            if (!EmailService::isNotificationEnabled($clinic_id, 'appointment_notifications')) {
                Log::info('EmailService: Appointment notifications disabled for clinic: ' . $clinic_id);
                return;
            }

            // Prepare email content
            $subject = 'Appointment ' . ucfirst(strtolower($newStatus)) . ' - Polyclinic HMS';
            
            $message = '';
            if ($newStatus === 'Approved') {
                $message = 'Your appointment request has been approved. We look forward to seeing you.';
                if ($appointment->preferred_date) {
                    $message .= ' Your scheduled appointment date is ' . \Carbon\Carbon::parse($appointment->preferred_date)->format('F d, Y');
                    if ($appointment->preferred_time) {
                        $message .= ' at ' . $appointment->preferred_time;
                    }
                }
            } elseif ($newStatus === 'Rejected') {
                $message = 'We regret to inform you that your appointment request could not be accommodated at this time.';
                if ($appointment->admin_reply) {
                    $message .= ' ' . $appointment->admin_reply;
                }
            }

            // Send email using EmailService
            $htmlBody = $this->generateAppointmentEmailHtml($appointment, $newStatus, $message);
            EmailService::sendEmail($appointment->email, $subject, $htmlBody, $clinic_id, true);

        } catch (\Exception $e) {
            Log::error('ExternalLinksWebsiteAppointmentsController: Error sending appointment email: ' . $e->getMessage());
            // Don't fail the request if email sending fails
        }
    }

    /**
     * Generate HTML email content for appointment notification
     */
    private function generateAppointmentEmailHtml($appointment, $status, $message)
    {
        $statusColor = [
            'Pending' => '#856404',
            'Approved' => '#155724',
            'Rejected' => '#721c24',
            'Completed' => '#004085',
            'Cancelled' => '#6c757d'
        ];

        $statusBg = [
            'Pending' => '#fff3cd',
            'Approved' => '#d4edda',
            'Rejected' => '#f8d7da',
            'Completed' => '#cce5ff',
            'Cancelled' => '#e2e3e5'
        ];

        $color = $statusColor[$status] ?? '#333333';
        $bgColor = $statusBg[$status] ?? '#f0f0f0';

        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Polyclinic HMS</h1>
                            <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">Appointment ' . ucfirst(strtolower($status)) . '</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <p style="margin: 0 0 15px 0;">Dear ' . htmlspecialchars($appointment->first_name . ' ' . $appointment->last_name) . ',</p>
                                        <p style="margin: 0 0 15px 0;">' . htmlspecialchars($message) . '</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Status:</span>
                                        <span style="display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; background-color: ' . $bgColor . '; color: ' . $color . ';">' . htmlspecialchars($status) . '</span>
                                    </td>
                                </tr>';

        if ($appointment->preferred_date) {
            $html .= '<tr>
                    <td style="padding-bottom: 15px;">
                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Preferred Date:</span>
                        <span style="color: #333333;">' . \Carbon\Carbon::parse($appointment->preferred_date)->format('F d, Y') . '</span>
                    </td>
                </tr>';
        }

        if ($appointment->preferred_time) {
            $html .= '<tr>
                    <td style="padding-bottom: 15px;">
                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Preferred Time:</span>
                        <span style="color: #333333;">' . htmlspecialchars($appointment->preferred_time) . '</span>
                    </td>
                </tr>';
        }

        if ($appointment->admin_reply) {
            $html .= '<tr>
                    <td style="margin-top: 20px; padding: 15px; background-color: #e8f4f8; border-radius: 5px;">
                        <strong style="display: block; margin-bottom: 8px;">Additional Message:</strong>
                        <span style="color: #333333;">' . nl2br(htmlspecialchars($appointment->admin_reply)) . '</span>
                    </td>
                </tr>';
        }

        $html .= '</table>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding: 20px; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; background-color: #ffffff;">
                            <p style="margin: 5px 0;">This is an automated email from Polyclinic HMS System.</p>
                            <p style="margin: 5px 0;">For inquiries, please contact us directly.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>';

        return $html;
    }
}

