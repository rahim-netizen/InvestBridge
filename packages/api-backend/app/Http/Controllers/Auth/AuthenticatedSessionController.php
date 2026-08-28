<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Enforce email verification check before issuing token
        if ($user instanceof User && !$user->isAdmin() && !$user->hasVerifiedEmail()) {
            Auth::guard('web')->logout();

            return response()->json([
                'message' => 'Your email address is not verified. Please check your inbox and verify your email within 5 minutes before signing in.',
                'requires_verification' => true,
            ], 403);
        }

        // Generate Sanctum Bearer Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    /**
     * Destroy an authenticated session / revoke current token.
     */
    public function destroy(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()?->delete();
        }

        return response()->json([
            'message' => 'Logout successful',
        ]);
    }
}

