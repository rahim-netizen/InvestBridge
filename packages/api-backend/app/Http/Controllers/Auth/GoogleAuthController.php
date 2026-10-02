<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\User;
use App\Services\GoogleOAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * "Continue with Gmail" sign-in / sign-up.
 *
 * Runs Google's standard authorization-code flow. The callback cannot return
 * JSON because the browser is redirected there directly, so it parks a
 * one-time code in the cache and bounces to the SPA, which then trades the code
 * for a Sanctum token over XHR.
 */
class GoogleAuthController extends Controller
{
    // How long an unused handoff code stays valid.
    protected const HANDOFF_TTL_SECONDS = 300;

    /**
     * Report whether Google sign-in is usable, so the UI can hide the button
     * instead of offering a flow that cannot finish.
     */
    public function config(): JsonResponse
    {
        return response()->json([
            'enabled' => (new GoogleOAuthService())->isConfigured(),
        ]);
    }

    /**
     * Start the flow: remember a CSRF state, then hand off to Google.
     */
    public function redirect(Request $request, GoogleOAuthService $google): Response
    {
        if (! $google->isConfigured()) {
            return response('Google sign-in is not configured.', 503);
        }

        $state = Str::random(40);
        $request->session()->put('google_oauth_state', $state);

        return redirect()->away($google->authorizationUrl($state));
    }

    /**
     * Google's callback: verify the state, read the account, then sign in or
     * create the user and park a one-time code for the SPA.
     */
    public function callback(Request $request, GoogleOAuthService $google): Response
    {
        $frontendBase = rtrim(
            env('FRONTEND_URL', config('app.url', 'http://localhost:5173')),
            '/',
        );

        // Nothing usable came back, so send the user back with the reason.
        if ($request->query('error')) {
            return $this->backToSpa($frontendBase, 'error');
        }

        $expected = $request->session()->pull('google_oauth_state');
        $given = $request->query('state');

        if (! $expected || ! $given || ! hash_equals($expected, $given)) {
            return $this->backToSpa($frontendBase, 'state');
        }

        $code = $request->query('code');
        if (! $code) {
            return $this->backToSpa($frontendBase, 'code');
        }

        try {
            $token = $google->exchangeCode($code);
            $info = $google->userInfo($token['access_token'] ?? '');
        } catch (\Throwable $e) {
            logger()->warning('Google sign-in failed: ' . $e->getMessage());

            return $this->backToSpa($frontendBase, 'gateway');
        }

        $email = strtolower(trim((string) ($info['email'] ?? '')));
        $sub = (string) ($info['sub'] ?? '');

        // Google only returns a verified email for accounts that have been
        // verified, so the address is trustworthy here.
        if (! filter_var($email, FILTER_VALIDATE_EMAIL) || ! $sub) {
            return $this->backToSpa($frontendBase, 'account');
        }

        // The rest of the platform is @gmail.com only, so keep Google sign-in
        // under the same rule.
        if (! Str::endsWith($email, '@gmail.com')) {
            return $this->backToSpa($frontendBase, 'domain');
        }

        $user = DB::transaction(function () use ($email, $sub, $info) {
            $user = User::where('google_id', $sub)->first()
                ?: User::where('email', $email)->first();

            if (! $user) {
                $user = User::create([
                    'name' => $this->nameFrom($info),
                    'email' => $email,
                    // The account is password-less, so store an unguessable
                    // placeholder: it satisfies the NOT NULL column and cannot
                    // be used to sign in.
                    'password' => Hash::make(Str::random(40)),
                    // Google has already verified the address.
                    'email_verified_at' => now(),
                    'google_id' => $sub,
                    'avatar' => $info['picture'] ?? null,
                ]);

                Profile::create([
                    'user_id' => $user->id,
                    'full_name' => $user->name,
                    'profile_image' => $user->avatar,
                    'profile_complete' => false,
                ]);

                return $user;
            }

            // An existing password account signing in with the same address
            // gets linked, and Google is trusted for verification from here.
            $updates = ['google_id' => $sub];

            if (! $user->avatar && ! empty($info['picture'])) {
                $updates['avatar'] = $info['picture'];
            }
            if (! $user->hasVerifiedEmail()) {
                $updates['email_verified_at'] = now();
            }

            $user->update($updates);

            return $user;
        });

        $token = $user->createToken('google_auth_token')->plainTextToken;

        // Hand the token to the SPA through a single-use code rather than
        // putting a bearer token in the URL, where it would leak into history
        // and any Referer header.
        $handoff = Str::random(40);
        Cache::put(
            'google_handoff:' . $handoff,
            ['token' => $token, 'user' => $user->toArray()],
            self::HANDOFF_TTL_SECONDS,
        );

        return $this->backToSpa($frontendBase, 'ok', $handoff);
    }

    /**
     * Trade the one-time code for the Sanctum token.
     */
    public function handoff(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $key = 'google_handoff:' . $validated['code'];
        $payload = Cache::pull($key);

        if (! $payload) {
            return response()->json([
                'message' => 'This sign-in link has expired. Please try again.',
            ], 422);
        }

        return response()->json([
            'access_token' => $payload['token'],
            'token_type' => 'Bearer',
            'user' => $payload['user'],
        ]);
    }

    /**
     * Best-effort display name, falling back to the local part of the address.
     */
    protected function nameFrom(array $info): string
    {
        $name = trim((string) ($info['name'] ?? ''));

        if ($name !== '') {
            return Str::limit($name, 255, '');
        }

        $email = (string) ($info['email'] ?? '');

        return Str::limit(Str::before($email, '@'), 255, '') ?: 'Investor';
    }

    /**
     * Bounce to the SPA's Google handoff route with the outcome in the query.
     */
    protected function backToSpa(string $frontendBase, string $status, ?string $code = null): Response
    {
        $url = "{$frontendBase}/google-auth-callback?status={$status}";
        if ($code) {
            $url .= '&code=' . rawurlencode($code);
        }

        return redirect()->away($url);
    }
}
