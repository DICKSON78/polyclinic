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
        Schema::create('ambulance_vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('registration_no')->unique();
            $table->foreignId('clinic_id')->nullable();
            $table->string('vehicle_type')->default('Ambulance')->comment('Ambulance, Patient Van, Boat');
            $table->string('model')->nullable();
            $table->string('capacity')->nullable();
            $table->string('driver_name')->nullable();
            $table->string('driver_phone')->nullable();
            $table->string('attendant_name')->nullable();
            $table->string('attendant_phone')->nullable();
            $table->enum('status', ['Available', 'On-Trip', 'Maintenance', 'Out-of-Service'])->default('Available');
            $table->text('equipment_notes')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();

            $table->index('status');
        });

        Schema::create('ambulance_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_no')->unique();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('patient_id')->nullable();
            $table->foreignId('requested_by')->nullable();
            $table->string('pickup_location');
            $table->string('destination');
            $table->dateTime('pickup_time')->nullable();
            $table->string('patient_condition')->nullable()->comment('Stable, Moderate, Critical');
            $table->string('transport_type')->default('Emergency')->comment('Emergency, Routine, Inter-facility, Discharge');
            $table->text('special_requirements')->nullable();
            $table->enum('status', ['Pending', 'Assigned', 'In-Progress', 'Completed', 'Cancelled'])->default('Pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();
            $table->foreign('patient_id')->references('id')->on('patients')->nullOnDelete();
            $table->foreign('requested_by')->references('id')->on('users')->nullOnDelete();

            $table->index('status');
        });

        Schema::create('ambulance_trips', function (Blueprint $table) {
            $table->id();
            $table->string('trip_no')->unique();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('request_id');
            $table->foreignId('vehicle_id');
            $table->foreignId('driver_id')->nullable();
            $table->foreignId('attendant_id')->nullable();
            $table->dateTime('dispatched_at')->nullable();
            $table->dateTime('arrived_at_pickup')->nullable();
            $table->dateTime('departed_pickup')->nullable();
            $table->dateTime('arrived_at_destination')->nullable();
            $table->integer('distance_km')->nullable();
            $table->string('fuel_used_litres')->nullable();
            $table->string('overtime_hours')->nullable();
            $table->text('trip_report')->nullable();
            $table->enum('status', ['Dispatched', 'En-Route', 'On-Scene', 'Transporting', 'Completed', 'Cancelled'])->default('Dispatched');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();
            $table->foreign('request_id')->references('id')->on('ambulance_requests')->cascadeOnDelete();
            $table->foreign('vehicle_id')->references('id')->on('ambulance_vehicles')->restrictOnDelete();
            $table->foreign('driver_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('attendant_id')->references('id')->on('users')->nullOnDelete();

            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ambulance_trips');
        Schema::dropIfExists('ambulance_requests');
        Schema::dropIfExists('ambulance_vehicles');
    }
};
