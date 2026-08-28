<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $messages = DB::table('chat_messages')->get();

        foreach ($messages as $message) {
            DB::table('chat_messages')
                ->where('id', $message->id)
                ->update(['message' => Crypt::encryptString($message->message)]);
        }
    }

    public function down(): void
    {
        // Encrypted messages cannot be safely changed back to plain text.
    }
};
