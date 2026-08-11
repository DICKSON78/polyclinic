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
        Schema::create('mortuary_bodies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('clinic_id')->nullable()->index();
            $table->string('body_no')->unique();
            $table->unsignedBigInteger('patient_id')->nullable()->index();
            $table->string('deceased_name');
            $table->enum('gender', ['Male', 'Female'])->nullable();
            $table->string('age')->nullable();
            $table->dateTime('date_of_death')->nullable();
            $table->string('cause_of_death')->nullable();
            $table->dateTime('admitted_at')->nullable();
            $table->unsignedBigInteger('admitted_by')->nullable();
            $table->string('storage_location')->nullable();
            $table->enum('status', ['In-Storage', 'Released', 'Cremated', 'Transferred'])->default('In-Storage');
            $table->dateTime('released_at')->nullable();
            $table->unsignedBigInteger('released_by')->nullable();
            $table->string('received_by_name')->nullable();
            $table->string('received_by_phone')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('set null');
        });

        Schema::create('death_certificates', function (Blueprint $table) {
            $table->id();
            $table->string('certificate_no')->unique();
            $table->unsignedBigInteger('clinic_id')->nullable()->index();
            $table->unsignedBigInteger('body_id')->nullable()->index();
            $table->unsignedBigInteger('patient_id')->nullable()->index();
            $table->string('deceased_name');
            $table->enum('gender', ['Male', 'Female'])->nullable();
            $table->date('date_of_birth')->nullable();
            $table->dateTime('date_of_death')->nullable();
            $table->string('place_of_death')->nullable();
            $table->string('cause_of_death')->nullable();
            $table->unsignedBigInteger('doctor_id')->nullable();
            $table->dateTime('issued_at')->nullable();
            $table->enum('status', ['Draft', 'Issued', 'Void'])->default('Draft');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('body_id')->references('id')->on('mortuary_bodies')->onDelete('set null');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('death_certificates');
        Schema::dropIfExists('mortuary_bodies');
    }
};
