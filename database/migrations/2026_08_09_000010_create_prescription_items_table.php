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
        Schema::create('prescription_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id');
            $table->foreignId('medicine_id');
            $table->string('medicine_name')->nullable();
            $table->string('dosage')->nullable();
            $table->string('frequency')->nullable();
            $table->string('duration')->nullable();
            $table->string('duration_unit')->default('days');
            $table->decimal('quantity', 12, 2)->default(0);
            $table->string('unit')->nullable();
            $table->string('meal')->default('None')->comment('None, Before, After');
            $table->text('instructions')->nullable();
            $table->enum('status', ['Pending', 'Partially Dispensed', 'Dispensed'])->default('Pending');
            $table->decimal('dispensed_qty', 12, 2)->default(0);
            $table->dateTime('dispensed_at')->nullable();
            $table->foreignId('dispensed_by')->nullable();
            $table->timestamps();

            $table->foreign('prescription_id')->references('id')->on('prescriptions')->cascadeOnDelete();
            $table->foreign('medicine_id')->references('id')->on('items');
            $table->foreign('dispensed_by')->references('id')->on('users')->nullOnDelete();

            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescription_items');
    }
};
