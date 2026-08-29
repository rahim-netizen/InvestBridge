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
        if (! Schema::hasColumn('opportunities', 'investor_id')) {
            Schema::table('opportunities', function (Blueprint $table) {
                $table->foreignId('investor_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('opportunities', 'investor_id')) {
            Schema::table('opportunities', function (Blueprint $table) {
                $table->dropForeign(['investor_id']);
                $table->dropColumn('investor_id');
            });
        }
    }
};
