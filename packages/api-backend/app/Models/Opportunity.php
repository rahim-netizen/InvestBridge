<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

    #[Fillable([
    'user_id',
    'title',
    'company',
    'sector',
    'location',
    'funding_goal',
    'description',
    'timeline',
    'image',
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
