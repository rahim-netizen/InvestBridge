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

        $user = Auth::user();
        $sessionCookie = config('session.cookie', 'investbridge_session');

        // Enforce email verification check before issuing cookie session
        if ($user instanceof User && !$user->hasVerifiedEmail()) {
            Auth::guard('web')->logout();

            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            // STRICT ENFORCEMENT: Unverified login attempt MUST NOT issue or retain any cookie
            return response()->json([
                'message' => 'Your email address is not verified. Please check your inbox and verify your email within 5 minutes before signing in.',
                'requires_verification' => true,
            ], 403)
            ->withoutCookie($sessionCookie)
            ->withoutCookie('laravel_session')
            ->withoutCookie('XSRF-TOKEN')
            ->withCookie(cookie()->forget($sessionCookie))
            ->withCookie(cookie()->forget('laravel_session'))
            ->withCookie(cookie()->forget('XSRF-TOKEN'));
        }

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $sessionCookieName = config('session.cookie', 'investbridge_session');

        return response()->json([
            'message' => 'Logout successful',
        ])
        ->withoutCookie($sessionCookieName)
        ->withoutCookie('laravel_session')
        ->withoutCookie('XSRF-TOKEN')
        ->withCookie(cookie()->forget($sessionCookieName))
        ->withCookie(cookie()->forget('laravel_session'))
        ->withCookie(cookie()->forget('XSRF-TOKEN'));
    }
}
