<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'user_id',
    'title',
    'company',
    'sector',
    'stage',
    'location',
    'funding_goal',
    'raised',
    'pct',
    'description',
    'timeline',
    'next_milestone',
    'business_model',
    'target_audience',
    'posted_by',
    'posted_by_name',
])]
class Opportunity extends Model
{
    protected $table = 'opportunities';

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
