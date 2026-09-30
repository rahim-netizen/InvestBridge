<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'connected_opportunity_id',
    'investor_id',
    'amount',
    'currency',
    'tran_id',
    'val_id',
    'status',
])]
class Payout extends Model
{
    protected $table = 'payouts';

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function connection(): BelongsTo
    {
        return $this->belongsTo(ConnectedOpportunity::class, 'connected_opportunity_id');
    }

    public function investor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'investor_id');
    }
}