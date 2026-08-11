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
        Schema::create('radiology_request_exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('radiology_request_id');
            $table->foreignId('radiology_exam_id');
            $table->enum('status', ['Pending', 'Performed', 'Completed'])->default('Pending');
            $table->text('findings')->nullable();
            $table->text('impression')->nullable();
            $table->text('conclusion')->nullable();
            $table->dateTime('result_entered_at')->nullable();
            $table->foreignId('result_entered_by')->nullable();
            $table->timestamps();

            $table->foreign('radiology_request_id')->references('id')->on('radiology_requests')->cascadeOnDelete();
            $table->foreign('radiology_exam_id')->references('id')->on('radiology_exams')->cascadeOnDelete();
            $table->foreign('result_entered_by')->references('id')->on('users')->nullOnDelete();

            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('radiology_request_exams');
    }
};
