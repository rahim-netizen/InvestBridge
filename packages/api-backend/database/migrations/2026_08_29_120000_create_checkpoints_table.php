<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checkpoints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opportunity_id')
                ->constrained('opportunities')
                ->cascadeOnDelete();
            $table->foreignId('investor_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('entrepreneur_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount', 14, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checkpoints');
    }
};
