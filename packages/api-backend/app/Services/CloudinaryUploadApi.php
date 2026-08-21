<?php

namespace App\Services;

use Cloudinary\Api\Upload\UploadApi;
use App\Services\CloudinaryUploadClient;

class CloudinaryUploadApi extends UploadApi
{
    public function __construct($configuration = null)
    {
        $this->apiClient = new CloudinaryUploadClient($configuration);
    }
}