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
        if (! Schema::hasColumn('connected_opportunities', 'status')) {
            Schema::table('connected_opportunities', function (Blueprint $table) {
                $table->string('status')
                    ->default('NA')
                    ->after('investment_amount');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('connected_opportunities', 'status')) {
            Schema::table('connected_opportunities', function (Blueprint $table) {
                $table->dropColumn('status');
            });
        }
    }
};
