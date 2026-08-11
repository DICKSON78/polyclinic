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
        Schema::create('er_visits', function (Blueprint $table) {
            $table->id();
            $table->string('visit_no')->unique();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('patient_id');
            $table->foreignId('triaged_by')->nullable();
            $table->foreignId('doctor_id')->nullable();
            $table->foreignId('nurse_id')->nullable();
            $table->dateTime('arrival_time')->default(now());
            $table->dateTime('seen_time')->nullable();
            $table->dateTime('discharge_time')->nullable();
            $table->string('triage_category')->default('General')->comment('General, Urgent, Emergency');
            $table->string('priority')->default('Stable')->comment('Stable, Serious, Critical');
            $table->text('chief_complaint')->nullable();
            $table->text('history')->nullable();
            $table->text('assessment')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('treatment')->nullable();
            $table->string('disposition')->nullable()->comment('Admitted, Discharged, Referred, Observed, Died');
            $table->foreignId('admission_id')->nullable();
            $table->string('referral_to')->nullable();
            $table->text('outcome')->nullable();
            $table->enum('status', ['Waiting', 'In-Treatment', 'Admitted', 'Discharged', 'Referred', 'Cancelled'])->default('Waiting');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
            $table->foreign('triaged_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('doctor_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('nurse_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('admission_id')->references('id')->on('admissions')->nullOnDelete();

            $table->index('status');
            $table->index('arrival_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('er_visits');
    }
};
