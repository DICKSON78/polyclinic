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
        Schema::create('inpatient_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('admission_id');
            $table->foreignId('patient_id');
            $table->foreignId('noted_by');
            $table->string('note_type')->default('Progress')->comment('Progress, Nursing, Physician, Procedure, Other');
            $table->text('note_text');
            $table->dateTime('noted_at')->default(now());
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();
            $table->foreign('admission_id')->references('id')->on('admissions')->cascadeOnDelete();
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
            $table->foreign('noted_by')->references('id')->on('users')->restrictOnDelete();

            $table->index('noted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inpatient_notes');
    }
};
