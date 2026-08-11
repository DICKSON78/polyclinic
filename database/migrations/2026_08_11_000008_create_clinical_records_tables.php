<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('discharge_summaries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('clinic_id')->nullable()->index();
            $table->unsignedBigInteger('admission_id')->unique();
            $table->unsignedBigInteger('patient_id')->nullable()->index();
            $table->text('admission_reason')->nullable();
            $table->text('diagnoses')->nullable();
            $table->text('procedures')->nullable();
            $table->text('medications')->nullable();
            $table->text('follow_up_instructions')->nullable();
            $table->enum('discharge_condition', ['Stable', 'Improved', 'Recovered', 'Unchanged', 'Worsened'])->nullable();
            $table->text('summary')->nullable();
            $table->unsignedBigInteger('doctor_id')->nullable();
            $table->enum('status', ['Draft', 'Finalized'])->default('Draft');
            $table->dateTime('prepared_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('admission_id')->references('id')->on('admissions')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('set null');
        });

        Schema::create('nursing_charts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('clinic_id')->nullable()->index();
            $table->unsignedBigInteger('admission_id')->index();
            $table->unsignedBigInteger('patient_id')->nullable()->index();
            $table->date('chart_date')->index();
            $table->enum('shift', ['Morning', 'Evening', 'Night'])->nullable();
            $table->decimal('temperature', 5, 1)->nullable();
            $table->decimal('pulse', 8, 2)->nullable();
            $table->decimal('respiration', 8, 2)->nullable();
            $table->string('blood_pressure')->nullable();
            $table->decimal('spo2', 5, 1)->nullable();
            $table->decimal('blood_sugar', 8, 2)->nullable();
            $table->unsignedInteger('pain_level')->nullable();
            $table->text('nursing_notes')->nullable();
            $table->text('observations')->nullable();
            $table->unsignedBigInteger('recorded_by')->nullable();
            $table->dateTime('recorded_at')->nullable();
            $table->timestamps();

            $table->foreign('admission_id')->references('id')->on('admissions')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('set null');
        });

        Schema::create('fluid_balances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('clinic_id')->nullable()->index();
            $table->unsignedBigInteger('admission_id')->index();
            $table->unsignedBigInteger('patient_id')->nullable()->index();
            $table->date('balance_date')->index();
            $table->enum('shift', ['Morning', 'Evening', 'Night'])->nullable();
            $table->decimal('intake_oral', 10, 2)->default(0);
            $table->decimal('intake_iv', 10, 2)->default(0);
            $table->decimal('intake_other', 10, 2)->default(0);
            $table->decimal('output_urine', 10, 2)->default(0);
            $table->decimal('output_drain', 10, 2)->default(0);
            $table->decimal('output_other', 10, 2)->default(0);
            $table->unsignedBigInteger('recorded_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('admission_id')->references('id')->on('admissions')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('set null');
        });

        Schema::create('mar_entries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('clinic_id')->nullable()->index();
            $table->unsignedBigInteger('admission_id')->index();
            $table->unsignedBigInteger('patient_id')->nullable()->index();
            $table->string('medication_name');
            $table->string('dose')->nullable();
            $table->string('route')->nullable();
            $table->dateTime('scheduled_time')->index();
            $table->enum('status', ['Scheduled', 'Given', 'Refused', 'Withheld'])->default('Scheduled');
            $table->dateTime('given_at')->nullable();
            $table->unsignedBigInteger('given_by')->nullable();
            $table->string('reason_omitted')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('admission_id')->references('id')->on('admissions')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('mar_entries');
        Schema::dropIfExists('fluid_balances');
        Schema::dropIfExists('nursing_charts');
        Schema::dropIfExists('discharge_summaries');
    }
};
