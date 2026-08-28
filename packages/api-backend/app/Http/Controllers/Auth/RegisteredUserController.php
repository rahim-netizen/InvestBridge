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
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'regex:/^[a-zA-Z0-9._%+-]+@gmail\.com$/i',
                'unique:'.User::class,
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'email.regex' => 'Only @gmail.com email addresses are allowed.',
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

        // Generate a 5-minute temporary signed verification URL. The signature
        // is computed on the path/query only (relative) so it validates no
        // matter which host the link is opened from, while the URL itself
        // stays absolute (with APP_URL) so it is clickable in the email.
        $verifyUrl = rtrim(config('app.url'), '/') . URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(5),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())],
            false
        );

        // Send verification email
        try {
            Mail::to($user->email)->send(
                new WelcomeEmail(
                    "Thank you for signing up for InvestBridge! Please click the link below within 5 minutes to verify your email address to complete your account setup.",
                    "Verify Your InvestBridge Account",
                    $verifyUrl
                )
            );
        } catch (\Throwable $e) {
            logger()->warning('Verification mail failed to send: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Registration successful! A verification link valid for 5 minutes has been sent to your email. Please verify to activate your account.',
            'user' => $user,
            'requires_verification' => true,
            'verification_url' => $verifyUrl,
        ], 201);
    }
}
