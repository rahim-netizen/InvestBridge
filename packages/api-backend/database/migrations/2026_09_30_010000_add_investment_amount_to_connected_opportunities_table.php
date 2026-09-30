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
        if (! Schema::hasColumn('connected_opportunities', 'investment_amount')) {
            Schema::table('connected_opportunities', function (Blueprint $table) {
                $table->decimal('investment_amount', 15, 2)
                    ->default(0)
                    ->after('opportunity_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('connected_opportunities', 'investment_amount')) {
            Schema::table('connected_opportunities', function (Blueprint $table) {
                $table->dropColumn('investment_amount');
            });
        }
    }
};
