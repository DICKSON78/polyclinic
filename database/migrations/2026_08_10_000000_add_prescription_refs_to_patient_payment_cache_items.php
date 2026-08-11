<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('patient_payment_cache_items', function (Blueprint $table) {
            $table->foreignId('prescription_id')->nullable()->after('medicine_id');
            $table->foreignId('prescription_item_id')->nullable()->after('prescription_id');

            $table->foreign('prescription_id')
                ->references('id')
                ->on('prescriptions')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreign('prescription_item_id')
                ->references('id')
                ->on('prescription_items')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('patient_payment_cache_items', function (Blueprint $table) {
            $table->dropForeign(['prescription_item_id']);
            $table->dropForeign(['prescription_id']);
            $table->dropColumn(['prescription_item_id', 'prescription_id']);
        });
    }
};
