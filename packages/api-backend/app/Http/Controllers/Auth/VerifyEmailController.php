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
     * Mark the user's email address as verified, issue token, and log user in.
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

        // Validate 5-minute signed URL
        $isValidSignature = $request->hasValidRelativeSignature() || $request->hasValidSignature();

        if (!$isValidSignature) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Invalid or expired verification link.'], 403);
            }
            return redirect($frontendUrl . '/verify-email-pending?error=expired&email=' . urlencode($user->email));
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        // Issue Sanctum Token for the verified user
        $token = $user->createToken('auth_token')->plainTextToken;

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Email verified successfully!',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user,
            ]);
        }

        // Redirect directly to Profile Creation page with Bearer token passed
        return redirect(
            $frontendUrl . '/profile?verified=1' .
            '&token=' . urlencode($token) .
            '&id=' . $user->id .
            '&email=' . urlencode($user->email) .
            '&name=' . urlencode($user->name)
        );
    }
}
