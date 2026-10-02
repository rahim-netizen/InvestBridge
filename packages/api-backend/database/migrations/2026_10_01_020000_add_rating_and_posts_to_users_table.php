<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'rating')) {
                // Out of five, kept as a decimal so a 4.5 average is
                // representable once real ratings are collected.
                $table->decimal('rating', 3, 2)->default(0)->after('avatar');
            }

            if (! Schema::hasColumn('users', 'posts')) {
                // How many opportunities this user has created.
                $table->unsignedInteger('posts')->default(0)->after('rating');
            }
        });

        $this->backfillPostCounts();
    }

    /**
     * Seed the counter for users who already have posts, so the column is
     * correct the moment it exists rather than only for new activity.
     */
    protected function backfillPostCounts(): void
    {
        DB::table('users')->update(['posts' => 0]);

        DB::table('opportunities')
            ->select('user_id', DB::raw('COUNT(*) as total'))
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->orderBy('user_id')
            ->chunk(200, function ($rows) {
                foreach ($rows as $row) {
                    DB::table('users')
                        ->where('id', $row->user_id)
                        ->update(['posts' => (int) $row->total]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $drops = [];

            if (Schema::hasColumn('users', 'posts')) {
                $drops[] = 'posts';
            }
            if (Schema::hasColumn('users', 'rating')) {
                $drops[] = 'rating';
            }

            if ($drops) {
                $table->dropColumn($drops);
            }
        });
    }
};