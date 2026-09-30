<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'user_id',
    'opportunity_id',
    'investment_amount',
    'status',
    'payout_amount',
    'paid_at',
])]
class ConnectedOpportunity extends Model
{
    protected $table = 'connected_opportunities';

    protected $casts = [
        'investment_amount' => 'decimal:2',
        'payout_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function opportunity()
    {
        return $this->belongsTo(Opportunity::class);
    }
}