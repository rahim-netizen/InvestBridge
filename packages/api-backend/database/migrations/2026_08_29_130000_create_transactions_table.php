<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('tran_id')->unique();
            $table->foreignId('opportunity_id')
                ->constrained('opportunities')
                ->cascadeOnDelete();
            $table->foreignId('investor_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->decimal('amount', 14, 2);
            $table->string('currency')->default('BDT');
            $table->json('checkpoints')->nullable();
            $table->string('status')->default('pending');
            $table->string('val_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
