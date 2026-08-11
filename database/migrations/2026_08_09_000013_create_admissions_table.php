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
        Schema::create('admissions', function (Blueprint $table) {
            $table->id();
            $table->string('admission_no')->unique();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('patient_id');
            $table->foreignId('hospital_ward_id')->nullable();
            $table->foreignId('bed_id')->nullable();
            $table->foreignId('admitted_by');
            $table->foreignId('doctor_id')->nullable();
            $table->dateTime('admission_date')->default(now());
            $table->string('admission_reason')->nullable();
            $table->text('diagnosis')->nullable();
            $table->string('condition')->default('Stable')->comment('Stable, Serious, Critical');
            $table->text('notes')->nullable();
            $table->string('discharge_reason')->nullable();
            $table->text('discharge_notes')->nullable();
            $table->foreignId('discharged_by')->nullable();
            $table->dateTime('discharge_date')->nullable();
            $table->enum('status', ['Admitted', 'Discharged'])->default('Admitted');
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
            $table->foreign('hospital_ward_id')->references('id')->on('hospital_wards')->nullOnDelete();
            $table->foreign('bed_id')->references('id')->on('beds')->nullOnDelete();
            $table->foreign('admitted_by')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('doctor_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('discharged_by')->references('id')->on('users')->nullOnDelete();

            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admissions');
    }
};
