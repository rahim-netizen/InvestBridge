<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeEmail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Resend a 5-minute email verification link.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $sessionCookie = config('session.cookie', 'investbridge_session');
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'If an account exists with that email address, a new verification link has been sent.',
            ])
            ->withoutCookie($sessionCookie)
            ->withoutCookie('laravel_session')
            ->withoutCookie('XSRF-TOKEN')
            ->withCookie(cookie()->forget($sessionCookie))
            ->withCookie(cookie()->forget('laravel_session'))
            ->withCookie(cookie()->forget('XSRF-TOKEN'));
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Your email address is already verified. You can sign in.',
                'already_verified' => true,
            ]);
        }

        // Generate a new 5-minute temporary signed verification URL
        $verifyUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(5),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())]
        );

        try {
            Mail::to($user->email)->send(
                new WelcomeEmail(
                    "You requested a new verification link for InvestBridge. Please click the button below within 5 minutes to verify your email address and activate your account.",
                    "New Email Verification Link - InvestBridge",
                    $verifyUrl
                )
            );
        } catch (\Throwable $e) {
            logger()->warning('Resend verification mail failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'A new verification link valid for 5 minutes has been sent to your email address.',
            'verification_url' => $verifyUrl,
        ])
        ->withoutCookie($sessionCookie)
        ->withoutCookie('laravel_session')
        ->withoutCookie('XSRF-TOKEN')
        ->withCookie(cookie()->forget($sessionCookie))
        ->withCookie(cookie()->forget('laravel_session'))
        ->withCookie(cookie()->forget('XSRF-TOKEN'));
    }
}
