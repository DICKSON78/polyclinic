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
        Schema::create('lab_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('category')->nullable();
            $table->string('specimen_type')->nullable();
            $table->text('preparation')->nullable();
            $table->string('unit')->nullable();
            $table->string('reference_range')->nullable();
            $table->double('price')->nullable();
            $table->integer('turnaround_time')->nullable()->comment('Expected turnaround in hours');
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();

            $table->index('clinic_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_tests');
    }
};
