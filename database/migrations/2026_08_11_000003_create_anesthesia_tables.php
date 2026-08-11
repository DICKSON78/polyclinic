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
        Schema::create('anesthesia_records', function (Blueprint $table) {
            $table->id();
            $table->string('record_no')->unique();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('patient_id');
            $table->foreignId('surgery_id')->nullable();
            $table->foreignId('admission_id')->nullable();
            $table->foreignId('anesthesiologist_id')->nullable();
            $table->string('anesthesia_type')->default('General')->comment('General, Regional, Local, Sedation');
            $table->string('asa_class')->nullable()->comment('ASA I-VI');
            $table->string('airway')->nullable()->comment('ETT, LMA, Mask, Other');
            $table->string('fasting_hours')->nullable();
            $table->text('allergies')->nullable();
            $table->text('pre_op_assessment')->nullable();
            $table->string('induction_agent')->nullable();
            $table->text('maintenance_agents')->nullable();
            $table->text('reversal_agents')->nullable();
            $table->string('iv_fluids_ml')->nullable();
            $table->string('blood_transfusion_ml')->nullable();
            $table->string('urine_output_ml')->nullable();
            $table->string('blood_loss_ml')->nullable();
            $table->dateTime('induction_time')->nullable();
            $table->dateTime('emergence_time')->nullable();
            $table->dateTime('recovery_time')->nullable();
            $table->text('intraop_complications')->nullable();
            $table->text('postop_complications')->nullable();
            $table->text('postop_instructions')->nullable();
            $table->enum('status', ['In-Progress', 'Completed', 'Cancelled'])->default('In-Progress');
            $table->foreignId('created_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
            $table->foreign('surgery_id')->references('id')->on('surgeries')->nullOnDelete();
            $table->foreign('admission_id')->references('id')->on('admissions')->nullOnDelete();
            $table->foreign('anesthesiologist_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();

            $table->index('status');
            $table->index('induction_time');
        });

        Schema::create('anesthesia_vitals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anesthesia_record_id');
            $table->dateTime('recorded_at')->default(now());
            $table->string('heart_rate')->nullable();
            $table->string('blood_pressure')->nullable();
            $table->string('oxygen_saturation')->nullable();
            $table->string('respiratory_rate')->nullable();
            $table->string('temperature')->nullable();
            $table->string('etco2')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('anesthesia_record_id')->references('id')->on('anesthesia_records')->cascadeOnDelete();

            $table->index('anesthesia_record_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anesthesia_vitals');
        Schema::dropIfExists('anesthesia_records');
    }
};
