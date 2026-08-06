<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->string('profile_image')->nullable()->after('notes');
            $table->text('company_personnel_photos')->nullable()->after('profile_image');
            $table->text('nid_photos')->nullable()->after('company_personnel_photos');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn(['profile_image', 'company_personnel_photos', 'nid_photos']);
        });
    }
};