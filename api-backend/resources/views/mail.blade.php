<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $sub ?? 'InvestBridge Verification' }}</title>
    <style>
        body { font-family: sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #e2e8f0; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; }
        .footer { margin-top: 24px; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <h2>InvestBridge Email Verification</h2>
        <p>{{ $msg }}</p>
        @if(!empty($url))
            <p>Please click the button below within <strong>5 minutes</strong> to verify your email address and activate your account:</p>
            <p><a href="{{ $url }}" class="btn" target="_blank">Verify Email & Receive Cookie</a></p>
            <p style="font-size: 12px; color: #64748b; margin-top: 12px;">Or copy and paste this URL into your browser:<br><a href="{{ $url }}">{{ $url }}</a></p>
        @endif
        <div class="footer">
            <p>If you did not request this email, please ignore it.</p>
            <p>&copy; {{ date('Y') }} InvestBridge. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
