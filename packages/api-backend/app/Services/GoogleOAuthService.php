<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

/**
 * Minimal Google OAuth2 client.
 *
 * Implements the standard authorization-code flow directly rather than pulling
 * in Socialite, which will not install in this environment (the PHP build is
 * missing ext-fileinfo, so Composer cannot resolve the dependency tree).
 * Guzzle is already present, so this only needs the three documented Google
 * endpoints.
 */
class GoogleOAuthService
{
    protected const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

    protected const TOKEN_URL = 'https://oauth2.googleapis.com/token';

    protected const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

    /**
     * True when client credentials are configured, so the UI can hide the
     * button rather than offering a flow that cannot complete.
     */
    public function isConfigured(): bool
    {
        return (bool) Config::get('services.google.client_id')
            && (bool) Config::get('services.google.client_secret');
    }

    /**
     * The Google consent-screen URL to send the browser to. The state is
     * passed back by Google on the callback and verified there to prevent
     * cross-site request forgery.
     */
    public function authorizationUrl(string $state): string
    {
        $query = http_build_query([
            'client_id' => Config::get('services.google.client_id'),
            'redirect_uri' => Config::get('services.google.redirect_uri'),
            'response_type' => 'code',
            // Only the minimum needed to identify the account.
            'scope' => 'openid email profile',
            'access_type' => 'online',
            'prompt' => 'select_account',
            'state' => $state,
        ]);

        return self::AUTH_URL . '?' . $query;
    }

    /**
     * Exchange the authorization code for an access token.
     */
    public function exchangeCode(string $code): array
    {
        $response = $this->client()->post(self::TOKEN_URL, [
            'form_params' => [
                'code' => $code,
                'client_id' => Config::get('services.google.client_id'),
                'client_secret' => Config::get('services.google.client_secret'),
                'redirect_uri' => Config::get('services.google.redirect_uri'),
                'grant_type' => 'authorization_code',
            ],
        ]);

        return json_decode((string) $response->getBody(), true) ?: [];
    }

    /**
     * Read the signed-in account's id, email, name and picture.
     */
    public function userInfo(string $accessToken): array
    {
        $response = $this->client()->get(self::USERINFO_URL, [
            'headers' => ['Authorization' => 'Bearer ' . $accessToken],
        ]);

        return json_decode((string) $response->getBody(), true) ?: [];
    }

    protected function client(): Client
    {
        return new Client([
            'timeout' => 30,
            'connect_timeout' => 15,
            'http_errors' => true,
        ]);
    }
}