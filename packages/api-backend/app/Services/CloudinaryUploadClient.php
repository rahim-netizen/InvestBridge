<?php

namespace App\Services;

use Cloudinary\Api\UploadApiClient;

class CloudinaryUploadClient extends UploadApiClient
{
    protected function buildHttpClientConfig(): array
    {
        $config = parent::buildHttpClientConfig();

        $caBundle = base_path('certs/cacert.pem');
        if (file_exists($caBundle)) {
            $config['verify'] = $caBundle;
        }

        return $config;
    }
}