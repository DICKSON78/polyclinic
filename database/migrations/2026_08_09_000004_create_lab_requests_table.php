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
        Schema::create('lab_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_no')->unique();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('patient_id');
            $table->foreignId('consultation_id')->nullable();
            $table->foreignId('requested_by');
            $table->enum('priority', ['Routine', 'Urgent', 'Stat'])->default('Routine');
            $table->enum('status', ['Pending', 'In Progress', 'Completed', 'Cancelled'])->default('Pending');
            $table->text('clinical_notes')->nullable();
            $table->dateTime('sample_collected_at')->nullable();
            $table->foreignId('sample_collected_by')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->foreignId('completed_by')->nullable();
            $table->text('cancel_reason')->nullable();
            $table->timestamps();

            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
            $table->foreign('consultation_id')->references('id')->on('consultations')->nullOnDelete();
            $table->foreign('requested_by')->references('id')->on('users');
            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();

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
        Schema::dropIfExists('lab_requests');
    }
};
