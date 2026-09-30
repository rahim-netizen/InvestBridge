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
        if (Schema::hasColumn('connected_opportunities', 'payout_amount')) {
            return;
        }

        Schema::table('connected_opportunities', function (Blueprint $table) {
            // Snapshot of what the escrow payout actually settled at, so a
            // later change to the pot or the goal cannot rewrite history.
            $table->decimal('payout_amount', 15, 2)->nullable()->after('status');
            $table->timestamp('paid_at')->nullable()->after('payout_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('connected_opportunities', function (Blueprint $table) {
            if (Schema::hasColumn('connected_opportunities', 'paid_at')) {
                $table->dropColumn('paid_at');
            }
            if (Schema::hasColumn('connected_opportunities', 'payout_amount')) {
                $table->dropColumn('payout_amount');
            }
        });
    }
};
