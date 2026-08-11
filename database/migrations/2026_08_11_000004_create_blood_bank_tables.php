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
        Schema::create('blood_donors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable();
            $table->string('donor_no')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable()->comment('Male, Female');
            $table->string('blood_group')->nullable();
            $table->string('rh_factor')->nullable()->comment('Positive, Negative');
            $table->string('national_id')->nullable();
            $table->string('occupation')->nullable();
            $table->text('medical_history')->nullable();
            $table->string('status')->default('Active')->comment('Active, Deferred, Inactive');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();

            $table->index('status');
        });

        Schema::create('blood_bank_units', function (Blueprint $table) {
            $table->id();
            $table->string('unit_no')->unique();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('donor_id')->nullable();
            $table->string('blood_group');
            $table->string('rh_factor')->default('Positive')->comment('Positive, Negative');
            $table->string('component_type')->default('Whole Blood')->comment('Whole Blood, Packed Cells, Plasma, Platelets, Cryoprecipitate');
            $table->date('donation_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('volume_ml')->nullable();
            $table->string('storage_location')->nullable();
            $table->string('status')->default('Available')->comment('Available, Reserved, Cross-matched, Issued, Discarded, Expired');
            $table->foreignId('patient_id')->nullable();
            $table->dateTime('reserved_at')->nullable();
            $table->dateTime('issued_at')->nullable();
            $table->string('discard_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();
            $table->foreign('donor_id')->references('id')->on('blood_donors')->nullOnDelete();
            $table->foreign('patient_id')->references('id')->on('patients')->nullOnDelete();

            $table->index('status');
            $table->index('blood_group');
            $table->index('expiry_date');
        });

        Schema::create('transfusions', function (Blueprint $table) {
            $table->id();
            $table->string('transfusion_no')->unique();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('patient_id');
            $table->foreignId('unit_id');
            $table->foreignId('requested_by')->nullable();
            $table->foreignId('administered_by')->nullable();
            $table->string('indication')->nullable();
            $table->string('cross_match')->default('Pending')->comment('Pending, Compatible, Incompatible');
            $table->dateTime('cross_match_time')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('ended_at')->nullable();
            $table->string('vitals_before')->nullable();
            $table->string('vitals_after')->nullable();
            $table->string('reaction')->nullable()->comment('None, Febrile, Allergic, Hemolytic, Other');
            $table->text('reaction_notes')->nullable();
            $table->text('outcome')->nullable();
            $table->enum('status', ['Requested', 'Cross-matching', 'In-Progress', 'Completed', 'Cancelled'])->default('Requested');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
            $table->foreign('unit_id')->references('id')->on('blood_bank_units')->restrictOnDelete();
            $table->foreign('requested_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('administered_by')->references('id')->on('users')->nullOnDelete();

            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfusions');
        Schema::dropIfExists('blood_bank_units');
        Schema::dropIfExists('blood_donors');
    }
};
