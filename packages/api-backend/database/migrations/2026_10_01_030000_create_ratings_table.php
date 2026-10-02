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
        if (Schema::hasTable('ratings')) {
            return;
        }

        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            // The post the rating was earned on. Rating is only unlocked once
            // this post reaches "Completed".
            $table->foreignId('opportunity_id')
                ->constrained('opportunities')
                ->cascadeOnDelete();
            // The entrepreneur being rated (the post's owner).
            $table->foreignId('entrepreneur_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('investor_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->timestamps();

            // One rating per investor per post, enforced by the database so a
            // double submit cannot slip through a race.
            $table->unique(['investor_id', 'opportunity_id'], 'ratings_investor_opportunity_unique');

            $table->index(['entrepreneur_id', 'opportunity_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};