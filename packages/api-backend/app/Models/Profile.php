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

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
