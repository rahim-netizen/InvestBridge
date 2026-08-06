<?php

namespace App\Services;

use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Configuration\Configuration;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    public function __construct()
    {
        $url = config('services.cloudinary.url') ?: env('CLOUDINARY_URL');

        if ($url && !str_contains($url, '<') && !str_contains($url, '>')) {
            Configuration::instance($url . '?secure=true');
        }
    }

    /**
     * Upload a single image and return its secure URL, or null on failure.
     */
    public function uploadImage(?string $file, string $folder = 'investbridge/profiles'): ?string
    {
        if (empty($file)) {
            return null;
        }

        try {
            $result = (new CloudinaryUploadApi())->upload($file, [
                'folder' => $folder,
                'overwrite' => true,
            ]);

            return $result['secure_url'] ?? null;
        } catch (\Throwable $e) {
            Log::error('Cloudinary upload failed: ' . $e->getMessage());

            return null;
        }
    }

    /**
     * Upload multiple images and return their secure URLs.
     * Non-uploadable entries are skipped.
     *
     * @param  array<int, string>  $files
     * @return array<int, string>
     */
    public function uploadImages(array $files, string $folder = 'investbridge/profiles'): array
    {
        return array_values(array_filter(
            array_map(fn ($file) => $this->uploadImage($file, $folder), $files),
            fn ($url) => !empty($url)
        ));
    }
}