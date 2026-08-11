<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Department;
use App\Models\JobTitle;
use App\Models\Clinic;
use App\Models\UserPrivilege;

class ResetDatabaseAndCreateAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:reset-and-create-admin {--force : Force the operation without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete all data from database tables and create an admin user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->option('force')) {
            if (!$this->confirm('This will delete ALL data from your database. Are you sure you want to continue?')) {
                $this->info('Operation cancelled.');
                return;
            }
        }

        $this->info('Starting database reset and admin user creation...');

        try {
            // Disable foreign key checks to avoid constraint issues
            DB::statement('SET FOREIGN_KEY_CHECKS = 0');
            
            $this->info('Deleting all data from tables...');
            
            // List of tables to truncate (excluding migrations and failed_jobs)
            $tables = [
                'users',
                'patients',
                'consultations',
                'consultation_diagnoses',
                'consultation_external_examinations',
                'consultation_functional_tests',
                'consultation_fundoscopies',
                'consultation_refractions',
                'consultation_visual_acuities',
                'patient_check_ins',
                'patient_item_bills',
                'patient_item_bill_payments',
                'patient_item_payments',
                'patient_payment_cache',
                'patient_payment_cache_items',
                'patient_attachments',
                'patient_notifications',
                'patient_waiting_times',
                'doctor_tasks',
                'messages',
                'expenses',
                'expense_payments',
                'expense_categories',
                'stocktakes',
                'stocktake_items',
                'items',
                'item_prices',
                'item_types',
                'lens_types',
                'units_of_measure',
                'medicines',
                'medicine_taking',
                'inventory_items',
                'consultation_types',
                'payment_modes',
                'payment_channels',
                'departments',
                'job_titles',
                'districts',
                'wards',
                'regions',
                'diseases',
                'user_privileges',
                'preferences',
                'clinic_details',
                'cataract_surgery_records',
                'surgery_record_reports',
                'personal_access_tokens',
                'communication_logs',
                'daily_activities',
                'events',
                'research_plans',
                'marketing_strategies',
                'ideas',
                'information_sources'
            ];
            
            $progressBar = $this->output->createProgressBar(count($tables));
            $progressBar->start();
            
            foreach ($tables as $table) {
                try {
                    if (DB::getSchemaBuilder()->hasTable($table)) {
                        DB::table($table)->truncate();
                    }
                    $progressBar->advance();
                } catch (Exception $e) {
                    $this->warn("Could not truncate table {$table}: " . $e->getMessage());
                    $progressBar->advance();
                }
            }
            
            $progressBar->finish();
            $this->newLine();
            
            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS = 1');
            
            $this->info('All data deleted successfully!');
            
            // Create default clinic if it doesn't exist
            $clinic = Clinic::firstOrCreate(
                ['id' => 1],
                [
                    'name' => 'Default Clinic',
                    'address' => 'Default Address',
                    'phone' => '1234567890',
                    'email' => 'clinic@polyclinic-hms.com',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
            
            // Create default department if it doesn't exist
            $department = Department::firstOrCreate(
                ['id' => 1],
                [
                    'name' => 'Administration',
                    'description' => 'Administrative Department',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
            
            // Create default job title if it doesn't exist
            $jobTitle = JobTitle::firstOrCreate(
                ['id' => 1],
                [
                    'name' => 'Administrator',
                    'description' => 'System Administrator',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
            
            // Create admin user with tech credentials
            $adminUser = User::create([
                'clinic_id' => $clinic->id,
                'first_name' => 'Tech',
                'last_name' => 'Admin',
                'middle_name' => '',
                'designation' => 'System Administrator',
                'department_id' => $department->id,
                'job_title_id' => $jobTitle->id,
                'employee_number' => 'TECH001',
                'date_of_birth' => '1990-01-01',
                'gender' => 'Male',
                'national_id' => '123456789',
                'phone' => '1234567890',
                'email' => 'tech@polyclinic-hms.com',
                'username' => 'tech',
                'password' => Hash::make('tech'),
                'role' => 'Admin',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            // Assign all privileges to tech user
            $allPrivileges = [
                'dashboard',
                'reception',
                'medicine_center',
                'optician_center',
                'consultation_room',
                'procedure_room',
                'other_dispensing',
                'marketing',
                'financial_management',
                'payment_center',
                'inventory_management',
                'user_management',
                'settings',
                'patient_management',
                'doctor_management',
                'nurse_management',
                'staff_management',
                'clinic_management',
                'report_management',
                'backup_management',
                'system_administration',
                'data_export',
                'data_import',
                'audit_logs',
                'notification_management',
                'communication_management',
                'research_management',
                'marketing_management',
                'financial_reports',
                'patient_reports',
                'inventory_reports',
                'staff_reports',
                'system_reports',
                'emergency_access',
                'maintenance_mode',
                'database_management',
                'file_management',
                'security_management',
                'compliance_management',
                'quality_assurance',
                'training_management',
            ];
            
            foreach ($allPrivileges as $privilege) {
                UserPrivilege::create([
                    'user_id' => $adminUser->id,
                    'privilege' => $privilege
                ]);
            }
            
            $this->newLine();
            $this->info('✓ Admin user created successfully!');
            $this->table(
                ['Field', 'Value'],
                [
                    ['Username', 'tech'],
                    ['Password', 'tech'],
                    ['Role', 'Admin'],
                    ['Status', 'Active'],
                    ['Email', 'tech@polyclinic-hms.com'],
                    ['Privileges', count($allPrivileges) . ' privileges assigned'],
                ]
            );
            
            $this->info('Database reset and admin user creation completed successfully!');
            
        } catch (Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
        }
    }
}
