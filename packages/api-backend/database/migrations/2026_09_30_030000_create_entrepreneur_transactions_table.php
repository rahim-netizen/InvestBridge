<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('entrepreneur_transactions')) {
            return;
        }

        Schema::create('entrepreneur_transactions', function (Blueprint $table) {
            $table->id();
            // The post this submission belongs to.
            $table->foreignId('opportunity_id')
                ->constrained('opportunities')
                ->cascadeOnDelete();
            // The creator of the post, i.e. the entrepreneur who submitted it.
            $table->foreignId('entrepreneur_id')
                ->constrained('users')
                ->cascadeOnDelete();
            // Zero when the entrepreneur submits without paying.
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('currency')->default('BDT');
            $table->string('image')->nullable();
            $table->text('description');
            $table->string('tran_id')->nullable()->unique();
            $table->string('val_id')->nullable();
            // waived = submitted without paying, pending/validated/failed/cancelled = gateway flow
            $table->string('status')->default('waived');
            $table->timestamps();

            // One submission per post.
            $table->unique(['opportunity_id', 'entrepreneur_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entrepreneur_transactions');
    }
};
