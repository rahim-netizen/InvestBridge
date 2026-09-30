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
        if (! Schema::hasColumn('opportunities', 'invested_amount')) {
            Schema::table('opportunities', function (Blueprint $table) {
                $table->decimal('invested_amount', 15, 2)
                    ->nullable()
                    ->after('investor_id')
                    ->default(0);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('opportunities', 'invested_amount')) {
            Schema::table('opportunities', function (Blueprint $table) {
                $table->dropColumn('invested_amount');
            });
        }
    }
};