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
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->string('prescription_no')->unique();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('patient_id');
            $table->foreignId('consultation_id')->nullable();
            $table->foreignId('prescribed_by');
            $table->dateTime('date_prescribed')->nullable();
            $table->string('diagnosis')->nullable();
            $table->text('clinical_notes')->nullable();
            $table->enum('status', ['Active', 'Partially Dispensed', 'Dispensed', 'Cancelled', 'Expired'])->default('Active');
            $table->date('expires_at')->nullable();
            $table->text('cancel_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable();
            $table->dateTime('cancelled_at')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
            $table->foreign('consultation_id')->references('id')->on('consultations')->nullOnDelete();
            $table->foreign('prescribed_by')->references('id')->on('users');
            $table->foreign('cancelled_by')->references('id')->on('users')->nullOnDelete();

            $table->index('clinic_id');
            $table->index('status');
            $table->index(['patient_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};
