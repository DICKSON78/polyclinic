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
        Schema::create('inpatient_charges', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('clinic_id')->nullable()->index();
            $table->unsignedBigInteger('admission_id')->index();
            $table->unsignedBigInteger('patient_id')->nullable()->index();
            $table->enum('charge_type', ['Bed Day', 'Manual', 'Medication', 'Procedure'])->default('Manual');
            $table->string('description')->nullable();
            $table->date('charge_date')->index();
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('quantity', 10, 2)->default(1);
            $table->decimal('amount', 12, 2)->default(0);
            $table->unsignedBigInteger('charged_by')->nullable();
            $table->enum('status', ['Pending', 'Billed', 'Void'])->default('Pending');
            $table->unsignedBigInteger('billed_at_bill_id')->nullable();
            $table->dateTime('voided_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('admission_id')->references('id')->on('admissions')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('set null');

            $table->unique(['admission_id', 'charge_date', 'charge_type'], 'inpatient_charge_day_unique');
        });

        Schema::create('inpatient_bills', function (Blueprint $table) {
            $table->id();
            $table->string('bill_no')->unique();
            $table->unsignedBigInteger('clinic_id')->nullable()->index();
            $table->unsignedBigInteger('admission_id')->index();
            $table->unsignedBigInteger('patient_id')->nullable()->index();
            $table->decimal('amount', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->enum('status', ['Open', 'Partial', 'Paid', 'Void'])->default('Open');
            $table->dateTime('issued_at')->nullable();
            $table->unsignedBigInteger('issued_by')->nullable();
            $table->dateTime('settled_at')->nullable();
            $table->unsignedBigInteger('settled_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('admission_id')->references('id')->on('admissions')->onDelete('cascade');
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('set null');
        });

        Schema::create('inpatient_bill_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('bill_id')->index();
            $table->unsignedBigInteger('clinic_id')->nullable()->index();
            $table->decimal('amount', 12, 2)->default(0);
            $table->date('payment_date')->index();
            $table->unsignedBigInteger('payment_mode_id')->nullable();
            $table->unsignedBigInteger('recorded_by')->nullable();
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('bill_id')->references('id')->on('inpatient_bills')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('inpatient_bill_payments');
        Schema::dropIfExists('inpatient_bills');
        Schema::dropIfExists('inpatient_charges');
    }
};
