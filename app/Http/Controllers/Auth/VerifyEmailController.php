<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VerifyEmailController extends Controller
{
    /**
     * Mark the user's email address as verified, issue session cookie, and log user in.
     */
    public function __invoke(Request $request, $id, $hash)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $user = User::find($id);

        if (!$user) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'User not found.'], 404);
            }
            return redirect($frontendUrl . '/verify-email-pending?error=not_found');
        }

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Invalid or expired verification link.'], 403);
            }
            return redirect($frontendUrl . '/verify-email-pending?error=expired&email=' . urlencode($user->email));
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        // Issue session cookie and log user in now that email verification is complete
        Auth::login($user);

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Email verified successfully! Session cookie issued.',
                'user' => $user,
            ]);
        }

        return redirect($frontendUrl . '/profile?verified=1');
    }
}
