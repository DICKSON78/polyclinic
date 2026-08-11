<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('insurance_companies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable();
            $table->string('name');
            $table->string('code')->nullable();
            $table->enum('type', ['Government', 'Private'])->default('Private');
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();

            $table->foreign('clinic_id')
                ->references('id')
                ->on('clinics')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });

        Schema::create('patient_insurances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id');
            $table->foreignId('insurance_company_id');
            $table->string('member_number')->nullable();
            $table->string('card_number')->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();

            $table->foreign('patient_id')
                ->references('id')
                ->on('patients')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('insurance_company_id')
                ->references('id')
                ->on('insurance_companies')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });

        Schema::create('insurance_claims', function (Blueprint $table) {
            $table->id();
            $table->string('claim_no')->unique();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('insurance_company_id');
            $table->foreignId('patient_id');
            $table->foreignId('check_in_id')->nullable();
            $table->foreignId('consultation_id')->nullable();
            $table->date('service_date');
            $table->date('submitted_date')->nullable();
            $table->enum('status', ['Draft', 'Submitted', 'Approved', 'Rejected', 'Paid'])->default('Draft');
            $table->double('claim_amount')->default(0);
            $table->double('approved_amount')->nullable();
            $table->double('paid_amount')->nullable();
            $table->text('reject_reason')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->foreignId('submitted_by')->nullable();
            $table->foreignId('approved_by')->nullable();
            $table->foreignId('paid_by')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')
                ->references('id')
                ->on('clinics')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('insurance_company_id')
                ->references('id')
                ->on('insurance_companies')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreign('patient_id')
                ->references('id')
                ->on('patients')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreign('check_in_id')
                ->references('id')
                ->on('patient_check_ins')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('consultation_id')
                ->references('id')
                ->on('consultations')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('submitted_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('approved_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('paid_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->index('status');
            $table->index('service_date');
        });

        Schema::create('insurance_claim_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('insurance_claim_id');
            $table->foreignId('payment_cache_item_id')->nullable();
            $table->foreignId('item_id')->nullable();
            $table->string('item_name')->nullable();
            $table->double('quantity')->default(1);
            $table->double('unit_price')->default(0);
            $table->double('amount')->default(0);
            $table->timestamps();

            $table->foreign('insurance_claim_id')
                ->references('id')
                ->on('insurance_claims')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('payment_cache_item_id')
                ->references('id')
                ->on('patient_payment_cache_items')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('item_id')
                ->references('id')
                ->on('items')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('insurance_claim_items');
        Schema::dropIfExists('insurance_claims');
        Schema::dropIfExists('patient_insurances');
        Schema::dropIfExists('insurance_companies');
    }
};
