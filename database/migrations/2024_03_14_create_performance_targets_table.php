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
        Schema::create('performance_targets', function (Blueprint $table) {
            $table->id();
            $table->string('department'); // optometry, sales, crm
            $table->string('kpi_id'); // medicine_sales, return_patient_percentage, etc.
            $table->decimal('target', 15, 2)->default(0);
            $table->foreignId('clinic_id')->constrained('clinic_details')->onDelete('cascade');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['department', 'kpi_id', 'clinic_id'], 'perf_targets_unique');
        });

        // Insert default targets only if a clinic already exists
        if (\DB::table('clinic_details')->exists()) {
            DB::table('performance_targets')->insert([
                [
                    'department' => 'optometry',
                    'kpi_id' => 'medicine_sales',
                    'target' => 500000, // 500k TZS
                    'clinic_id' => \DB::table('clinic_details')->value('id'),
                    'created_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'department' => 'optometry',
                    'kpi_id' => 'return_patient_percentage',
                    'target' => 30, // 30%
                    'clinic_id' => \DB::table('clinic_details')->value('id'),
                    'created_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'department' => 'sales',
                    'kpi_id' => 'average_glass_daily_sales',
                    'target' => 200000, // 200k TZS per day
                    'clinic_id' => \DB::table('clinic_details')->value('id'),
                    'created_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'department' => 'sales',
                    'kpi_id' => 'glass_conversion_ratio',
                    'target' => 25, // 25%
                    'clinic_id' => \DB::table('clinic_details')->value('id'),
                    'created_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'department' => 'crm',
                    'kpi_id' => 'marketing_glass_leads',
                    'target' => 50, // 50 leads
                    'clinic_id' => \DB::table('clinic_details')->value('id'),
                    'created_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performance_targets');
    }
};
