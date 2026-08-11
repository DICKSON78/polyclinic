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
        Schema::create('beds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('hospital_ward_id');
            $table->string('bed_number');
            $table->string('bed_type')->default('Regular')->comment('Regular, Private, ICU');
            $table->enum('status', ['Available', 'Occupied', 'Reserved', 'Maintenance'])->default('Available');
            $table->foreignId('patient_id')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();
            $table->foreign('hospital_ward_id')->references('id')->on('hospital_wards')->cascadeOnDelete();
            $table->foreign('patient_id')->references('id')->on('patients')->nullOnDelete();

            $table->unique(['hospital_ward_id', 'bed_number']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beds');
    }
};
