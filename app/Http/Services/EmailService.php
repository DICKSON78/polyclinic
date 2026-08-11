<?php

namespace App\Http\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;
use Swift_SmtpTransport;
use Swift_Mailer;
use Swift_Message;

class EmailService
{
    /**
     * Get email alert settings for a clinic
     */
    public static function getEmailSettings($clinic_id)
    {
        try {
            if (!DB::getSchemaBuilder()->hasTable('email_alert_settings')) {
                return null;
            }

            $settings = DB::table('email_alert_settings')
                ->where('clinic_id', $clinic_id)
                ->first();

            // Return null if alerts are not enabled or settings are incomplete
            if (!$settings || !$settings->email_alerts_enabled) {
                return null;
            }

            // Check if required settings are present
            if (empty($settings->smtp_host) || empty($settings->smtp_username) || empty($settings->from_email)) {
                return null;
            }

            return $settings;
        } catch (\Exception $e) {
            Log::error('EmailService: Error getting email settings: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Send email using custom SMTP settings from database
     */
    public static function sendEmail($to, $subject, $body, $clinic_id, $isHtml = true)
    {
        try {
            $settings = self::getEmailSettings($clinic_id);
            
            if (!$settings) {
                Log::info('EmailService: Email alerts disabled or settings incomplete for clinic: ' . $clinic_id);
                return false;
            }

            // Create Swift Mailer with custom SMTP configuration
            $transport = new Swift_SmtpTransport(
                $settings->smtp_host,
                $settings->smtp_port ?? 587,
                $settings->smtp_encryption === 'none' ? null : $settings->smtp_encryption
            );

            $transport->setUsername($settings->smtp_username);
            $transport->setPassword($settings->smtp_password);
            
            $mailer = new Swift_Mailer($transport);

            // Create message
            $message = new Swift_Message($subject);
            $message->setFrom([$settings->from_email => $settings->from_name ?? 'Polyclinic HMS']);
            $message->setTo($to);
            
            if ($isHtml) {
                $message->setBody($body, 'text/html');
            } else {
                $message->setBody($body, 'text/plain');
            }

            // Send email
            $result = $mailer->send($message);
            
            if ($result) {
                Log::info('EmailService: Email sent successfully to: ' . $to);
                return true;
            } else {
                Log::warning('EmailService: Failed to send email to: ' . $to);
                return false;
            }
        } catch (\Exception $e) {
            Log::error('EmailService: Error sending email: ' . $e->getMessage(), [
                'to' => $to,
                'subject' => $subject,
                'clinic_id' => $clinic_id,
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Check if a specific notification type is enabled
     */
    public static function isNotificationEnabled($clinic_id, $notificationType)
    {
        try {
            if (!DB::getSchemaBuilder()->hasTable('email_alert_settings')) {
                return false;
            }

            $settings = DB::table('email_alert_settings')
                ->where('clinic_id', $clinic_id)
                ->first();

            if (!$settings || !$settings->email_alerts_enabled) {
                return false;
            }

            // Check if the specific notification type is enabled
            $property = $notificationType;
            return isset($settings->$property) && $settings->$property === true;
        } catch (\Exception $e) {
            Log::error('EmailService: Error checking notification enabled: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get recipient email addresses for clinic notifications
     */
    public static function getClinicRecipients($clinic_id)
    {
        try {
            // Get admin users for the clinic
            $users = DB::table('users')
                ->where(function ($query) use ($clinic_id) {
                    if ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    }
                    // Get users with Admin role (is_admin is an accessor, not a column)
                    $query->where('role', 'Admin');
                })
                ->whereNotNull('email')
                ->where('email', '!=', '')
                ->pluck('email')
                ->toArray();

            // Also try to get email from clinic record
            if ($clinic_id) {
                $clinic = DB::table('clinics')->where('id', $clinic_id)->first();
                if ($clinic && !empty($clinic->email)) {
                    if (!in_array($clinic->email, $users)) {
                        $users[] = $clinic->email;
                    }
                }
            }

            return array_filter($users); // Remove empty values
        } catch (\Exception $e) {
            Log::error('EmailService: Error getting clinic recipients: ' . $e->getMessage());
            return [];
        }
    }
}

