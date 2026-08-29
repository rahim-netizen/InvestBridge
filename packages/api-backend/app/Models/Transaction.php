<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'tran_id',
    'opportunity_id',
    'investor_id',
    'amount',
    'currency',
    'checkpoints',
    'status',
    'val_id',
])]
class Transaction extends Model
{
    protected $table = 'transactions';

    protected $casts = [
        'amount' => 'decimal:2',
        'checkpoints' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function opportunity(): BelongsTo
    {
        return $this->belongsTo(Opportunity::class);
    }

    public function investor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'investor_id');
    }
}
