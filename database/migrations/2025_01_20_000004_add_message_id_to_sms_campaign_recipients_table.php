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
        Schema::table('sms_campaign_recipients', function (Blueprint $table) {
            $table->string('message_id')->nullable()->after('error_message');
            $table->text('api_response')->nullable()->after('message_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sms_campaign_recipients', function (Blueprint $table) {
            $table->dropColumn('message_id');
            $table->dropColumn('api_response');
        });
    }
};
