<?php

namespace App\Http\Services;

use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class MackSmsService
{
    private $apiUrl = 'https://macksms.co.tz/portal/api/text';
    private $senderId = 'Sikaf';
    private $secretKey = '9fc3d7152ba9336a670e36d0ed79bc43';
    private $secretCode = '02d506e9d55d1b3500f6da86ff42754b';
    private $apiKey = 'Basic OWZjM2Q3MTUyYmE5MzM2YTY3MGUzNmQwZWQ3OWJjNDM6MDJkNTA2ZTlkNTVkMWIzNTAwZjZkYTg2ZmY0Mjc1NGI=';

    /**
     * Send single SMS
     *
     * @param string $phone
     * @param string $message
     * @return array|null
     */
    public function sendSingleSms($phone, $message)
    {
        try {
            $client = new Client([
                'timeout' => 10,
                'connect_timeout' => 5,
            ]);

            $body = [
                'request_type' => 'single_sms',
                'sender_id' => $this->senderId,
                'phone' => $this->formatPhoneNumberForMackSms($phone),
                'message' => $message
            ];

            $response = $client->post($this->apiUrl, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'Authorization' => $this->apiKey
                ],
                'json' => $body
            ]);

            $responseBody = $response->getBody()->getContents();
            $responseData = json_decode($responseBody, true);

            Log::info('MACKSMS Single SMS Response', [
                'phone' => $phone,
                'response' => $responseData
            ]);

            return $responseData;

        } catch (Exception $exception) {
            Log::error('MACKSMS Single SMS Error', [
                'phone' => $phone,
                'error' => $exception->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Send multiple SMS
     *
     * @param array $recipients - Array of ['phone' => '...', 'message' => '...']
     * @return array|null
     */
    public function sendMultipleSms($recipients)
    {
        try {
            $client = new Client([
                'timeout' => 10,
                'connect_timeout' => 5,
            ]);

            $messageData = [];
            foreach ($recipients as $recipient) {
                $messageData[] = [
                    'from' => $this->senderId,
                    'to' => $this->formatPhoneNumberForMackSms($recipient['phone']),
                    'text' => $recipient['message']
                ];
            }

            $body = [
                'request_type' => 'multiple_sms',
                'sender_id' => $this->senderId,
                'message_data' => $messageData
            ];

            $response = $client->post($this->apiUrl, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'Authorization' => $this->apiKey
                ],
                'json' => $body
            ]);

            $responseBody = $response->getBody()->getContents();
            $responseData = json_decode($responseBody, true);

            Log::info('MACKSMS Multiple SMS Response', [
                'recipients_count' => count($recipients),
                'response' => $responseData
            ]);

            return $responseData;

        } catch (Exception $exception) {
            Log::error('MACKSMS Multiple SMS Error', [
                'recipients_count' => count($recipients),
                'error' => $exception->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Format phone number for MACKSMS API
     * Based on successful test: 0654600081 -> 255654600081
     *
     * @param string $phone
     * @return string
     */
    private function formatPhoneNumberForMackSms($phone)
    {
        // Remove any non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // If starts with 0 and has 10 digits, replace 0 with 255
        if (str_starts_with($phone, '0') && strlen($phone) == 10) {
            return '255' . substr($phone, 1);
        }
        
        // If starts with 255 and has 12 digits, return as is
        if (str_starts_with($phone, '255') && strlen($phone) == 12) {
            return $phone;
        }
        
        // If starts with +255, remove + and return
        if (str_starts_with($phone, '+255') && strlen($phone) == 13) {
            return substr($phone, 1);
        }
        
        return $phone;
    }

    /**
     * Get SMS balance from MACKSMS API
     *
     * @return array|null
     */
    public function getBalance()
    {
        try {
            $client = new Client([
                'timeout' => 10,
                'connect_timeout' => 5,
            ]);

            $response = $client->get('https://macksms.co.tz/portal/api/balance', [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'Authorization' => $this->apiKey
                ]
            ]);

            $responseBody = $response->getBody()->getContents();
            $responseData = json_decode($responseBody, true);

            Log::info('MACKSMS Balance Response', [
                'response' => $responseData
            ]);

            return $responseData;

        } catch (Exception $exception) {
            Log::error('MACKSMS Balance Error', [
                'error' => $exception->getMessage()
            ]);
            return null;
        }
    }
}
