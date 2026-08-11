<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the vital_signs table for triage module.
     */
    public function up(): void
    {
        if (!Schema::hasTable('vital_signs')) {
            Schema::create('vital_signs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('clinic_id')->nullable()->constrained('clinics')->cascadeOnUpdate()->nullOnDelete();
                $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
                $table->foreignId('consultation_id')->nullable()->constrained('consultations')->cascadeOnDelete();
                $table->unsignedBigInteger('triaged_by')->nullable();
                $table->foreign('triaged_by')->references('id')->on('users')->cascadeOnUpdate()->nullOnDelete();

                $table->decimal('temperature', 5, 2)->nullable();
                $table->integer('systolic_bp')->nullable();
                $table->integer('diastolic_bp')->nullable();
                $table->integer('heart_rate')->nullable();
                $table->integer('respiratory_rate')->nullable();
                $table->integer('oxygen_saturation')->nullable();
                $table->decimal('weight_kg', 6, 2)->nullable();
                $table->decimal('height_cm', 6, 2)->nullable();
                $table->decimal('bmi', 5, 2)->nullable();
                $table->string('blood_group')->nullable();
                $table->text('chief_complaint')->nullable();
                $table->string('triage_category', 50)->nullable();
                $table->text('notes')->nullable();

                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vital_signs');
    }
};
