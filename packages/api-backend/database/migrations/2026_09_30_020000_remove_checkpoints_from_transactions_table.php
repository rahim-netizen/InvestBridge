<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasColumn('transactions', 'checkpoints')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->dropColumn('checkpoints');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('transactions', 'checkpoints')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->json('checkpoints')->nullable();
            });
        }
    }
};
