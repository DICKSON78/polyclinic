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
        Schema::create('lab_request_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_request_id');
            $table->foreignId('lab_test_id');
            $table->enum('status', ['Pending', 'Collected', 'Completed'])->default('Pending');
            $table->string('result')->nullable();
            $table->string('unit')->nullable();
            $table->string('reference_range')->nullable();
            $table->boolean('is_abnormal')->default(false);
            $table->text('interpretation')->nullable();
            $table->dateTime('result_entered_at')->nullable();
            $table->foreignId('result_entered_by')->nullable();
            $table->string('status_updated_by')->nullable();
            $table->timestamps();

            $table->foreign('lab_request_id')->references('id')->on('lab_requests')->cascadeOnDelete();
            $table->foreign('lab_test_id')->references('id')->on('lab_tests')->cascadeOnDelete();
            $table->foreign('result_entered_by')->references('id')->on('users')->nullOnDelete();

            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_request_tests');
    }
};
