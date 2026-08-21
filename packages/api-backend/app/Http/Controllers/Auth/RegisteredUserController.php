<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeEmail;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->has('password_confirmation')) {
            $request->merge(['password_confirmation' => $request->password]);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->string('password')),
            'email_verified_at' => null,
        ]);

        Profile::create([
            'user_id' => $user->id,
            'full_name' => $user->name,
            'profile_complete' => false,
        ]);

        // Generate 5-minute temporary signed verification URL
        $verifyUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(5),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())]
        );

        // Send verification email
        try {
            Mail::to($user->email)->send(
                new WelcomeEmail(
                    "Thank you for signing up for InvestBridge! Please click the link below within 5 minutes to verify your email address. Once verified, your authentication session cookie will be issued automatically.",
                    "Verify Your InvestBridge Account",
                    $verifyUrl
                )
            );
        } catch (\Throwable $e) {
            logger()->warning('Verification mail failed to send: ' . $e->getMessage());
        }

        $sessionCookie = config('session.cookie', 'investbridge_session');

        // STRICT ENFORCEMENT: NO COOKIE IS ISSUED ON SIGN UP UNTIL VERIFICATION IS COMPLETED
        return response()->json([
            'message' => 'Registration successful! A verification link valid for 5 minutes has been sent to your email. Please verify to receive your session cookie.',
            'user' => $user,
            'requires_verification' => true,
            'verification_url' => $verifyUrl,
        ], 201)
        ->withoutCookie($sessionCookie)
        ->withoutCookie('laravel_session')
        ->withoutCookie('XSRF-TOKEN')
        ->withCookie(cookie()->forget($sessionCookie))
        ->withCookie(cookie()->forget('laravel_session'))
        ->withCookie(cookie()->forget('XSRF-TOKEN'));
    }
}
