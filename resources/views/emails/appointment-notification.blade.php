<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Polyclinic HMS</h1>
                            <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal;">{{ $subject }}</h2>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Patient Name:</span>
                                        <span style="color: #333333;">{{ $appointment->first_name }} {{ $appointment->last_name }}</span>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Email:</span>
                                        <span style="color: #333333;">{{ $appointment->email }}</span>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Phone:</span>
                                        <span style="color: #333333;">{{ $appointment->phone }}</span>
                                    </td>
                                </tr>
                                
                                @if($appointment->preferred_date)
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Preferred Date:</span>
                                        <span style="color: #333333;">{{ \Carbon\Carbon::parse($appointment->preferred_date)->format('F d, Y') }}</span>
                                    </td>
                                </tr>
                                @endif
                                
                                @if($appointment->preferred_time)
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Preferred Time:</span>
                                        <span style="color: #333333;">{{ $appointment->preferred_time }}</span>
                                    </td>
                                </tr>
                                @endif
                                
                                @if($appointment->reason)
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Reason:</span>
                                        <span style="color: #333333;">{{ $appointment->reason }}</span>
                                    </td>
                                </tr>
                                @endif
                                
                                <tr>
                                    <td style="padding-bottom: 15px;">
                                        <span style="font-weight: bold; color: #555555; display: inline-block; min-width: 150px;">Status:</span>
                                        @if(strtolower($appointment->status) === 'pending')
                                            <span style="display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; background-color: #fff3cd; color: #856404;">{{ $appointment->status }}</span>
                                        @elseif(strtolower($appointment->status) === 'approved')
                                            <span style="display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; background-color: #d4edda; color: #155724;">{{ $appointment->status }}</span>
                                        @elseif(strtolower($appointment->status) === 'rejected')
                                            <span style="display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; background-color: #f8d7da; color: #721c24;">{{ $appointment->status }}</span>
                                        @else
                                            <span style="display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; background-color: #e2e3e5; color: #333333;">{{ $appointment->status }}</span>
                                        @endif
                                    </td>
                                </tr>
                                
                                @if($customMessage)
                                <tr>
                                    <td style="margin-top: 20px; padding: 15px; background-color: #e8f4f8; border-radius: 5px;">
                                        <strong style="display: block; margin-bottom: 8px;">Message:</strong>
                                        <span style="color: #333333;">{{ $customMessage }}</span>
                                    </td>
                                </tr>
                                @endif
                                
                                @if($appointment->admin_reply)
                                <tr>
                                    <td style="margin-top: 20px; padding: 15px; background-color: #fff9e6; border-radius: 5px;">
                                        <strong style="display: block; margin-bottom: 8px;">Admin Reply:</strong>
                                        <span style="color: #333333;">{{ $appointment->admin_reply }}</span>
                                    </td>
                                </tr>
                                @endif
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="text-align: center; padding: 20px; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; background-color: #ffffff;">
                            <p style="margin: 5px 0;">This is an automated email from Polyclinic HMS System.</p>
                            <p style="margin: 5px 0;">Please do not reply to this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
