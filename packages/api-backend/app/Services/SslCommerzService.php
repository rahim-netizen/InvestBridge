<?php

namespace App\Services;

use Illuminate\Support\Facades\Config;

class SslCommerzService
{
    protected function isSandbox(): bool
    {
        return (bool) Config::get('services.sslcommerz.sandbox', true);
    }

    protected function baseUrl(): string
    {
        return $this->isSandbox()
            ? 'https://sandbox.sslcommerz.com'
            : 'https://securepay.sslcommerz.com';
    }

    /**
     * Initiate a payment session with SSLCommerz and return the raw response.
     */
    public function initiate(array $fields): array
    {
        $fields = array_merge([
            'store_id' => Config::get('services.sslcommerz.store_id'),
            'store_passwd' => Config::get('services.sslcommerz.store_password'),
            'currency' => Config::get('services.sslcommerz.currency', 'BDT'),
        ], $fields);

        $url = $this->baseUrl() . '/gwprocess/v4/api.php';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            throw new \Exception('SSLCommerz connection failed: ' . $error);
        }

        $result = json_decode((string) $response, true);
        if (!is_array($result)) {
            throw new \Exception('Invalid SSLCommerz response.');
        }

        return $result;
    }

    /**
     * Validate a completed transaction using its validation id.
     */
    public function validate(array $params): array
    {
        $query = http_build_query([
            'val_id' => $params['val_id'] ?? '',
            'store_id' => Config::get('services.sslcommerz.store_id'),
            'store_passwd' => Config::get('services.sslcommerz.store_password'),
            'format' => 'json',
        ]);

        $url = $this->baseUrl() . '/validator/api/validationserverAPI.php?' . $query;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode((string) $response, true);

        return is_array($result) ? $result : [];
    }
}
