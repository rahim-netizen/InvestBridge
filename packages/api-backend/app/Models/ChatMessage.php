<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['chat_hash', 'user_id', 'message'])]
class ChatMessage extends Model
{
    protected $table = 'chat_messages';

    protected function casts(): array
    {
        return [
            'message' => 'encrypted',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
