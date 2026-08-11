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
        Schema::create('operating_theatres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable();
            $table->string('name');
            $table->string('location')->nullable();
            $table->string('equipment_notes')->nullable();
            $table->enum('status', ['Active', 'Inactive', 'Maintenance'])->default('Active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();

            $table->index('status');
        });

        Schema::create('surgeries', function (Blueprint $table) {
            $table->id();
            $table->string('surgery_no')->unique();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('patient_id');
            $table->foreignId('theatre_id')->nullable();
            $table->foreignId('admission_id')->nullable();
            $table->foreignId('surgeon_id')->nullable();
            $table->foreignId('assistant_surgeon_id')->nullable();
            $table->foreignId('anesthesiologist_id')->nullable();
            $table->foreignId('scrub_nurse_id')->nullable();
            $table->string('procedure_name');
            $table->enum('procedure_type', ['Elective', 'Emergency', 'Urgent'])->default('Elective');
            $table->dateTime('scheduled_at')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('ended_at')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->string('pre_op_diagnosis')->nullable();
            $table->string('post_op_diagnosis')->nullable();
            $table->text('pre_op_notes')->nullable();
            $table->text('intra_op_notes')->nullable();
            $table->text('post_op_notes')->nullable();
            $table->string('blood_loss_ml')->nullable();
            $table->text('complications')->nullable();
            $table->text('outcome')->nullable();
            $table->enum('status', ['Scheduled', 'Ready', 'In-Progress', 'Completed', 'Postponed', 'Cancelled'])->default('Scheduled');
            $table->string('cancel_reason')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
            $table->foreign('theatre_id')->references('id')->on('operating_theatres')->nullOnDelete();
            $table->foreign('admission_id')->references('id')->on('admissions')->nullOnDelete();
            $table->foreign('surgeon_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('assistant_surgeon_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('anesthesiologist_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('scrub_nurse_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();

            $table->index('status');
            $table->index('scheduled_at');
        });

        Schema::create('surgical_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('surgery_id');
            $table->foreignId('author_id')->nullable();
            $table->string('note_type')->default('Intra-op')->comment('Pre-op, Intra-op, Post-op, Other');
            $table->text('note');
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();
            $table->foreign('surgery_id')->references('id')->on('surgeries')->cascadeOnDelete();
            $table->foreign('author_id')->references('id')->on('users')->nullOnDelete();

            $table->index('surgery_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surgical_notes');
        Schema::dropIfExists('surgeries');
        Schema::dropIfExists('operating_theatres');
    }
};
