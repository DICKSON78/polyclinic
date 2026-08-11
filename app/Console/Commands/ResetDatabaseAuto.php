<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ResetDatabaseAuto extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:reset-auto';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset the database and create a fresh admin user (auto-confirm)';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('=== DATABASE RESET SCRIPT (AUTO) ===');
        $this->warn('WARNING: This will delete ALL data in the database!');
        $this->info('Auto-confirming: YES');
        $this->newLine();

        try {
            // Test database connection first
            $this->info('1. Testing database connection...');
            DB::connection()->getPdo();
            $this->info('✅ Database connection successful');
            $this->newLine();

            // Disable foreign key checks temporarily
            $this->info('2. Disabling foreign key checks...');
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            $this->info('✅ Foreign key checks disabled');
            $this->newLine();

            // Get all table names
            $this->info('3. Getting all table names...');
            $tables = DB::select('SHOW TABLES');
            $tableNames = [];
            foreach ($tables as $table) {
                $tableNames[] = array_values((array)$table)[0];
            }
            $this->info("Found " . count($tableNames) . " tables");
            $this->newLine();

            // Delete all data from all tables
            $this->info('4. Deleting all data from tables...');
            foreach ($tableNames as $table) {
                if ($table !== 'migrations') { // Keep migrations table
                    try {
                        DB::table($table)->truncate();
                        $this->info("✅ Cleared table: $table");
                    } catch (\Exception $e) {
                        $this->warn("⚠️  Could not clear table $table: " . $e->getMessage());
                    }
                }
            }
            $this->newLine();

            // Re-enable foreign key checks
            $this->info('5. Re-enabling foreign key checks...');
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            $this->info('✅ Foreign key checks enabled');
            $this->newLine();

            // Create essential data
            $this->info('6. Creating essential data...');

            // Create clinic
            $this->info('Creating clinic...');
            $clinicId = DB::table('clinics')->insertGetId([
                'name' => 'Best Vision Eye Care',
                'phone' => '0678110376',
                'email' => 'info@bestvision.com',
                'address' => 'Natta, Mwanza',
                'sms_balance' => '0',
                'sms_sender_name' => 'BESTVISION',
                'logo' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->info("✅ Clinic created with ID: $clinicId");

            // Create departments
            $this->info('Creating departments...');
            $departments = [
                ['name' => 'Administration', 'description' => 'Administrative department'],
                ['name' => 'Reception', 'description' => 'Patient reception'],
                ['name' => 'Consultation', 'description' => 'Doctor consultations'],
                ['name' => 'Optician', 'description' => 'Optical services'],
                ['name' => 'Laboratory', 'description' => 'Lab services'],
                ['name' => 'Pharmacy', 'description' => 'Medicine dispensing'],
                ['name' => 'Surgery', 'description' => 'Surgical procedures'],
                ['name' => 'Emergency', 'description' => 'Emergency services'],
                ['name' => 'Marketing', 'description' => 'Marketing department'],
                ['name' => 'Finance', 'description' => 'Financial management'],
            ];

            foreach ($departments as $dept) {
                DB::table('departments')->insert([
                    'name' => $dept['name'],
                    'description' => $dept['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $this->info('✅ Departments created');

            // Create job titles
            $this->info('Creating job titles...');
            $jobTitles = [
                ['name' => 'Administrator', 'description' => 'System administrator'],
                ['name' => 'Doctor', 'description' => 'Medical doctor'],
                ['name' => 'Nurse', 'description' => 'Registered nurse'],
                ['name' => 'Receptionist', 'description' => 'Front desk staff'],
                ['name' => 'Optician', 'description' => 'Optical specialist'],
                ['name' => 'Technician', 'description' => 'Technical staff'],
                ['name' => 'Pharmacist', 'description' => 'Medicine specialist'],
                ['name' => 'Manager', 'description' => 'Department manager'],
            ];

            foreach ($jobTitles as $job) {
                DB::table('job_titles')->insert([
                    'name' => $job['name'],
                    'description' => $job['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $this->info('✅ Job titles created');

            // Create admin user
            $this->info('Creating admin user...');
            $adminId = DB::table('users')->insertGetId([
                'clinic_id' => $clinicId,
                'first_name' => 'Admin',
                'middle_name' => null,
                'last_name' => 'Admin',
                'designation' => 'Administrator',
                'department_id' => 1, // Administration
                'job_title_id' => 1, // Administrator
                'employee_number' => 'ADM001',
                'date_of_birth' => '1990-01-01',
                'gender' => 'Male',
                'national_id' => null,
                'phone' => '0000000000',
                'email' => 'admin@polyclinic-hms.com',
                'username' => 'admin',
                'password' => Hash::make('admin'),
                'remember_token' => null,
                'role' => 'Admin',
                'created_at' => now(),
                'created_by' => null,
                'status' => 'Active',
                'updated_at' => now(),
            ]);
            $this->info("✅ Admin user created with ID: $adminId");
            $this->info("   Username: admin");
            $this->info("   Password: admin");
            $this->newLine();

            // Create payment modes
            $this->info('Creating payment modes...');
            $paymentModes = [
                ['name' => 'Cash', 'description' => 'Cash payment', 'transaction_type' => 'Cash'],
                ['name' => 'Insurance', 'description' => 'Insurance payment', 'transaction_type' => 'Insurance'],
                ['name' => 'Credit', 'description' => 'Credit payment', 'transaction_type' => 'Credit'],
                ['name' => 'Mobile Money', 'description' => 'Mobile money payment', 'transaction_type' => 'Mobile Money'],
            ];

            foreach ($paymentModes as $mode) {
                DB::table('payment_modes')->insert([
                    'clinic_id' => $clinicId,
                    'name' => $mode['name'],
                    'description' => $mode['description'],
                    'transaction_type' => $mode['transaction_type'],
                    'status' => 'Active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $this->info('✅ Payment modes created');

            // Create information sources
            $this->info('Creating information sources...');
            $infoSources = [
                ['name' => 'Radio', 'description' => 'Radio advertisement'],
                ['name' => 'TV', 'description' => 'Television advertisement'],
                ['name' => 'Newspaper', 'description' => 'Newspaper advertisement'],
                ['name' => 'Referral', 'description' => 'Patient referral'],
                ['name' => 'Walk-in', 'description' => 'Walk-in patient'],
                ['name' => 'Social Media', 'description' => 'Social media advertisement'],
                ['name' => 'Website', 'description' => 'Website information'],
            ];

            foreach ($infoSources as $source) {
                DB::table('information_sources')->insert([
                    'clinic_id' => $clinicId,
                    'name' => $source['name'],
                    'description' => $source['description'],
                    'status' => 'Active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $this->info('✅ Information sources created');

            // Create regions (basic)
            $this->info('Creating basic regions...');
            $regions = [
                'Dar es Salaam',
                'Mwanza',
                'Arusha',
                'Dodoma',
                'Tanga',
            ];

            foreach ($regions as $region) {
                DB::table('regions')->insert([
                    'name' => $region,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $this->info('✅ Regions created');

            // Create preferences
            $this->info('Creating system preferences...');
            $preferences = [
                ['key' => 'CLINIC_NAME', 'value' => 'Best Vision Eye Care'],
                ['key' => 'CLINIC_PHONE', 'value' => '0678110376'],
                ['key' => 'CLINIC_EMAIL', 'value' => 'info@bestvision.com'],
                ['key' => 'CLINIC_ADDRESS', 'value' => 'Natta, Mwanza'],
                ['key' => 'SYSTEM_VERSION', 'value' => '1.0.0'],
                ['key' => 'MAINTENANCE_MODE', 'value' => 'No'],
            ];

            foreach ($preferences as $pref) {
                DB::table('preferences')->insert([
                    'key' => $pref['key'],
                    'value' => $pref['value'],
                ]);
            }
            $this->info('✅ System preferences created');

            $this->newLine();
            $this->info('=== RESET COMPLETE ===');
            $this->info('✅ Database has been completely reset');
            $this->info('✅ Fresh admin user created');
            $this->info('✅ Essential data seeded');
            $this->newLine();
            $this->info('Login credentials:');
            $this->info('Username: admin');
            $this->info('Password: admin');
            $this->newLine();
            $this->info('You can now login and test patient registration.');

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error during reset: ' . $e->getMessage());
            $this->error('Stack trace:');
            $this->error($e->getTraceAsString());
            return 1;
        }
    }
}
