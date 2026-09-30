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
        if (Schema::hasTable('payouts')) {
            return;
        }

        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            // The saved post this payout settles.
            $table->foreignId('connected_opportunity_id')
                ->constrained('connected_opportunities')
                ->cascadeOnDelete();
            // Who receives the money out of escrow.
            $table->foreignId('investor_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->string('currency')->default('BDT');
            $table->string('tran_id')->nullable()->unique();
            $table->string('val_id')->nullable();
            // pending = sent to the gateway, validated = money moved,
            // failed/cancelled = the admin backed out.
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payouts');
    }
};