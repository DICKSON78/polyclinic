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

class AppointmentsController extends Controller
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

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $status = $request->status;
        $search = $request->search;

        $data = Appointment::with(['repliedBy']);

        if ($status) {
            $data->where('status', $status);
        }

        if ($search) {
            $data->where(function ($query) use ($search) {
                $query->where('first_name', 'like', '%' . $search . '%')
                    ->orWhere('last_name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%');
            });
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
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:20',
            'preferred_date' => 'nullable|date',
            'preferred_time' => 'nullable|date_format:H:i',
            'reason' => 'nullable|string',
            'message' => 'nullable|string',
        ]);

        $appointment = Appointment::create($request->all());

        // Send email notification to clinic admins if enabled
        $this->sendNewAppointmentNotificationToAdmins($appointment);

        // Broadcast notification update so reception sees web bookings immediately
        Cache::flush();
        event(new NotificationUpdate());

        return $this->sendResponse($appointment, Response::HTTP_OK, 'Appointment request submitted successfully. We will contact you soon.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $appointment = Appointment::with(['repliedBy'])->findOrFail($id);
        return $this->sendResponse($appointment, Response::HTTP_OK, 'Success.');
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
            'status' => 'sometimes|required|in:Pending,Approved,Rejected,Completed,Cancelled',
            'admin_reply' => 'nullable|string',
        ]);

        $appointment = Appointment::findOrFail($id);
        
        $updateData = $request->only(['status', 'admin_reply']);
        
        if ($request->has('admin_reply') && $request->admin_reply) {
            $updateData['replied_by'] = $request->user()->id;
            $updateData['replied_at'] = now();
        }

        $oldStatus = $appointment->status;
        $appointment->update($updateData);

        // Send email notification to patient if status changed or admin replied
        if (($oldStatus !== ($request->status ?? $oldStatus)) || ($request->admin_reply && !empty($appointment->email))) {
            $this->sendAppointmentUpdateEmail($appointment, $request->status ?? $oldStatus);
        }

        // Clear notification cache and broadcast so counts drop when processed
        Cache::flush();
        event(new NotificationUpdate());

        return $this->sendResponse($appointment, Response::HTTP_OK, 'Appointment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Appointment deleted successfully.');
    }

    /**
     * Send email notification to clinic admins about new appointment
     */
    private function sendNewAppointmentNotificationToAdmins($appointment)
    {
        try {
            // Resolve clinic from available clinics (appointments are clinic-global)
            $clinic_id = \App\Models\Clinic::orderBy('id')->value('id') ?? 1;

            // Check if appointment notifications are enabled
            if (!EmailService::isNotificationEnabled($clinic_id, 'appointment_notifications')) {
                return;
            }

            // Get admin email addresses
            $recipients = EmailService::getClinicRecipients($clinic_id);

            if (empty($recipients)) {
                Log::info('EmailService: No recipients found for new appointment notification');
                return;
            }

            $subject = 'New Appointment Request - ' . $appointment->first_name . ' ' . $appointment->last_name;
            $htmlBody = $this->generateNewAppointmentEmailHtml($appointment);

            // Send to each admin
            foreach ($recipients as $recipient) {
                EmailService::sendEmail($recipient, $subject, $htmlBody, $clinic_id, true);
            }

        } catch (\Exception $e) {
            Log::error('AppointmentsController: Error sending new appointment email: ' . $e->getMessage());
        }
    }

    /**
     * Send appointment update email to patient
     */
    private function sendAppointmentUpdateEmail($appointment, $status)
    {
        try {
            if (empty($appointment->email)) {
                return;
            }

            $clinic_id = \App\Models\Clinic::orderBy('id')->value('id') ?? 1; // Resolve from available clinics

            // Check if appointment notifications are enabled
            if (!EmailService::isNotificationEnabled($clinic_id, 'appointment_notifications')) {
                return;
            }

            $subject = 'Appointment ' . ucfirst(strtolower($status)) . ' - Polyclinic HMS';
            
            $message = '';
            if ($status === 'Approved') {
                $message = 'Your appointment request has been approved. We look forward to seeing you.';
                if ($appointment->preferred_date) {
                    $message .= ' Your scheduled appointment date is ' . \Carbon\Carbon::parse($appointment->preferred_date)->format('F d, Y');
                    if ($appointment->preferred_time) {
                        $message .= ' at ' . $appointment->preferred_time;
                    }
                }
            } elseif ($status === 'Rejected') {
                $message = 'We regret to inform you that your appointment request could not be accommodated at this time.';
                if ($appointment->admin_reply) {
                    $message .= ' ' . $appointment->admin_reply;
                }
            } else {
                $message = 'Your appointment status has been updated to ' . $status . '.';
            }

            $htmlBody = $this->generateAppointmentEmailHtml($appointment, $status, $message);
            EmailService::sendEmail($appointment->email, $subject, $htmlBody, $clinic_id, true);

        } catch (\Exception $e) {
            Log::error('AppointmentsController: Error sending appointment update email: ' . $e->getMessage());
        }
    }

    /**
     * Generate HTML email content for new appointment notification (to admins)
     */
    private function generateNewAppointmentEmailHtml($appointment)
    {
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
                            <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">New Appointment Request</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <p style="margin: 0 0 15px 0;"><strong style="font-weight: bold;">A new appointment request has been submitted.</strong></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Patient Name:</span>
                                        <span style="color: #333333;">' . htmlspecialchars($appointment->first_name . ' ' . $appointment->last_name) . '</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Email:</span>
                                        <span style="color: #333333;">' . htmlspecialchars($appointment->email) . '</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Phone:</span>
                                        <span style="color: #333333;">' . htmlspecialchars($appointment->phone) . '</span>
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

        if ($appointment->reason) {
            $html .= '<tr>
                    <td style="padding-bottom: 15px;">
                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Reason:</span>
                        <span style="color: #333333;">' . nl2br(htmlspecialchars($appointment->reason)) . '</span>
                    </td>
                </tr>';
        }

        if ($appointment->message) {
            $html .= '<tr>
                    <td style="padding-bottom: 15px;">
                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Message:</span>
                        <span style="color: #333333;">' . nl2br(htmlspecialchars($appointment->message)) . '</span>
                    </td>
                </tr>';
        }

        $html .= '<tr>
                    <td style="padding-bottom: 15px;">
                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Submitted:</span>
                        <span style="color: #333333;">' . $appointment->created_at->format('F d, Y h:i A') . '</span>
                    </td>
                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding: 20px; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; background-color: #ffffff;">
                            <p style="margin: 5px 0;">Please review and respond to this appointment request in the system.</p>
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

    /**
     * Generate HTML email content for appointment status update (to patient)
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

