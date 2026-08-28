<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'user_id',
    'full_name',
    'company_name',
    'industry',
    'position',
    'website',
    'mission',
    'notes',
    'profile_image',
    'company_personnel_photos',
    'nid_photos',
    'profile_complete',
])]
class Profile extends Model
{
    protected $table = 'profiles';

    protected $casts = [
        'profile_complete' => 'boolean',
        'company_personnel_photos' => 'array',
        'nid_photos' => 'array',
    ];

    /**
     * Normalize photo fields to arrays. The `array` cast only decodes valid
     * JSON; legacy/plain-string values slip through as strings, which crashes
     * the client's `.map()`. Always hand back an array here.
     */
    public function getCompanyPersonnelPhotosAttribute($value)
    {
        return $this->normalizePhotoValue($value);
    }

    public function getNidPhotosAttribute($value)
    {
        return $this->normalizePhotoValue($value);
    }

    protected function normalizePhotoValue($value)
    {
        if (is_array($value)) {
            return $value;
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                return $decoded;
            }
            return $value === '' ? [] : [$value];
        }

        return [];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
