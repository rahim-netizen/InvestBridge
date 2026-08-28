<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('complaints', 'feedback')) {
            Schema::table('complaints', function (Blueprint $table) {
                $table->text('feedback')->nullable()->after('message');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('complaints', 'feedback')) {
            Schema::table('complaints', function (Blueprint $table) {
                $table->dropColumn('feedback');
            });
        }
    }
};
