<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CompleteSystemSetup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'setup:complete-system';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Complete the system setup with all necessary data for full functionality';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('=== COMPLETE SYSTEM SETUP ===');
        $this->info('Setting up all necessary data for full system functionality...');
        $this->newLine();

        try {
            // Test database connection
            $this->info('1. Testing database connection...');
            DB::connection()->getPdo();
            $this->info('✅ Database connection successful');
            $this->newLine();

            // Get clinic ID
            $clinic = DB::table('clinics')->first();
            if (!$clinic) {
                $this->error('❌ No clinic found. Please run db:reset-auto first.');
                return 1;
            }
            $clinicId = $clinic->id;

            // Create comprehensive departments
            $this->info('2. Creating comprehensive departments...');
            $departments = [
                ['name' => 'Administration', 'description' => 'Administrative department'],
                ['name' => 'Reception', 'description' => 'Patient reception and registration'],
                ['name' => 'Consultation', 'description' => 'Doctor consultations and examinations'],
                ['name' => 'Optician', 'description' => 'Optical services and lens fitting'],
                ['name' => 'Laboratory', 'description' => 'Lab tests and diagnostics'],
                ['name' => 'Pharmacy', 'description' => 'Medicine dispensing and inventory'],
                ['name' => 'Surgery', 'description' => 'Surgical procedures and operations'],
                ['name' => 'Emergency', 'description' => 'Emergency medical services'],
                ['name' => 'Marketing', 'description' => 'Marketing and outreach'],
                ['name' => 'Finance', 'description' => 'Financial management and billing'],
                ['name' => 'Nursing', 'description' => 'Nursing care and patient support'],
                ['name' => 'Radiology', 'description' => 'Imaging and diagnostic services'],
            ];

            foreach ($departments as $dept) {
                DB::table('departments')->updateOrInsert(
                    ['name' => $dept['name']],
                    [
                        'name' => $dept['name'],
                        'description' => $dept['description'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
            $this->info('✅ Departments created/updated');

            // Create comprehensive job titles
            $this->info('3. Creating comprehensive job titles...');
            $jobTitles = [
                ['name' => 'Administrator', 'description' => 'System administrator'],
                ['name' => 'Doctor', 'description' => 'Medical doctor'],
                ['name' => 'Nurse', 'description' => 'Registered nurse'],
                ['name' => 'Receptionist', 'description' => 'Front desk staff'],
                ['name' => 'Optician', 'description' => 'Optical specialist'],
                ['name' => 'Technician', 'description' => 'Technical staff'],
                ['name' => 'Pharmacist', 'description' => 'Medicine specialist'],
                ['name' => 'Manager', 'description' => 'Department manager'],
                ['name' => 'Cashier', 'description' => 'Payment processing staff'],
                ['name' => 'Lab Technician', 'description' => 'Laboratory technician'],
                ['name' => 'Surgery Assistant', 'description' => 'Surgical assistant'],
                ['name' => 'Marketing Officer', 'description' => 'Marketing specialist'],
            ];

            foreach ($jobTitles as $job) {
                DB::table('job_titles')->updateOrInsert(
                    ['name' => $job['name']],
                    [
                        'name' => $job['name'],
                        'description' => $job['description'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
            $this->info('✅ Job titles created/updated');

            // Create additional users for different roles
            $this->info('4. Creating additional users...');
            $users = [
                [
                    'first_name' => 'Dr. John',
                    'last_name' => 'Smith',
                    'username' => 'doctor1',
                    'role' => 'Doctor',
                    'department_id' => 3, // Consultation
                    'job_title_id' => 2, // Doctor
                    'designation' => 'Senior Doctor',
                ],
                [
                    'first_name' => 'Mary',
                    'last_name' => 'Johnson',
                    'username' => 'nurse1',
                    'role' => 'Nurse',
                    'department_id' => 11, // Nursing
                    'job_title_id' => 3, // Nurse
                    'designation' => 'Senior Nurse',
                ],
                [
                    'first_name' => 'Robert',
                    'last_name' => 'Wilson',
                    'username' => 'optician1',
                    'role' => 'Optician',
                    'department_id' => 4, // Optician
                    'job_title_id' => 5, // Optician
                    'designation' => 'Senior Optician',
                ],
                [
                    'first_name' => 'Sarah',
                    'last_name' => 'Brown',
                    'username' => 'reception1',
                    'role' => 'Receptionist',
                    'department_id' => 2, // Reception
                    'job_title_id' => 4, // Receptionist
                    'designation' => 'Senior Receptionist',
                ],
            ];

            foreach ($users as $userData) {
                DB::table('users')->updateOrInsert(
                    ['username' => $userData['username']],
                    [
                        'clinic_id' => $clinicId,
                        'first_name' => $userData['first_name'],
                        'middle_name' => null,
                        'last_name' => $userData['last_name'],
                        'designation' => $userData['designation'],
                        'department_id' => $userData['department_id'],
                        'job_title_id' => $userData['job_title_id'],
                        'employee_number' => strtoupper(substr($userData['username'], 0, 3)) . '001',
                        'date_of_birth' => '1985-01-01',
                        'gender' => 'Female',
                        'national_id' => null,
                        'phone' => '0000000000',
                        'email' => $userData['username'] . '@polyclinic-hms.com',
                        'username' => $userData['username'],
                        'password' => Hash::make('password123'),
                        'remember_token' => null,
                        'role' => $userData['role'],
                        'created_at' => now(),
                        'created_by' => 1, // Admin
                        'status' => 'Active',
                        'updated_at' => now(),
                    ]
                );
            }
            $this->info('✅ Additional users created');

            // Create comprehensive payment modes
            $this->info('5. Creating comprehensive payment modes...');
            $paymentModes = [
                ['name' => 'Cash', 'description' => 'Cash payment', 'transaction_type' => 'Cash'],
                ['name' => 'Insurance', 'description' => 'Insurance payment', 'transaction_type' => 'Insurance'],
                ['name' => 'Credit', 'description' => 'Credit payment', 'transaction_type' => 'Credit'],
                ['name' => 'Mobile Money', 'description' => 'Mobile money payment', 'transaction_type' => 'Mobile Money'],
                ['name' => 'Bank Transfer', 'description' => 'Bank transfer payment', 'transaction_type' => 'Bank Transfer'],
                ['name' => 'Cheque', 'description' => 'Cheque payment', 'transaction_type' => 'Cheque'],
                ['name' => 'Card Payment', 'description' => 'Credit/Debit card payment', 'transaction_type' => 'Card'],
            ];

            foreach ($paymentModes as $mode) {
                DB::table('payment_modes')->updateOrInsert(
                    ['name' => $mode['name'], 'clinic_id' => $clinicId],
                    [
                        'clinic_id' => $clinicId,
                        'name' => $mode['name'],
                        'description' => $mode['description'],
                        'transaction_type' => $mode['transaction_type'],
                        'status' => 'Active',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
            $this->info('✅ Payment modes created/updated');

            // Create comprehensive information sources
            $this->info('6. Creating comprehensive information sources...');
            $infoSources = [
                ['name' => 'Radio', 'description' => 'Radio advertisement'],
                ['name' => 'TV', 'description' => 'Television advertisement'],
                ['name' => 'Newspaper', 'description' => 'Newspaper advertisement'],
                ['name' => 'Referral', 'description' => 'Patient referral'],
                ['name' => 'Walk-in', 'description' => 'Walk-in patient'],
                ['name' => 'Social Media', 'description' => 'Social media advertisement'],
                ['name' => 'Website', 'description' => 'Website information'],
                ['name' => 'Billboard', 'description' => 'Billboard advertisement'],
                ['name' => 'Flyer', 'description' => 'Flyer distribution'],
                ['name' => 'Word of Mouth', 'description' => 'Word of mouth recommendation'],
                ['name' => 'Health Center', 'description' => 'Referral from health center'],
                ['name' => 'School', 'description' => 'School screening program'],
            ];

            foreach ($infoSources as $source) {
                DB::table('information_sources')->updateOrInsert(
                    ['name' => $source['name'], 'clinic_id' => $clinicId],
                    [
                        'clinic_id' => $clinicId,
                        'name' => $source['name'],
                        'description' => $source['description'],
                        'status' => 'Active',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
            $this->info('✅ Information sources created/updated');

            // Create comprehensive regions and districts
            $this->info('7. Creating comprehensive regions and districts...');
            $regions = [
                'Dar es Salaam' => ['Kinondoni', 'Temeke', 'Ilala'],
                'Mwanza' => ['Ilemela', 'Nyamagana'],
                'Arusha' => ['Arusha City', 'Arusha Rural'],
                'Dodoma' => ['Dodoma City', 'Dodoma Rural'],
                'Tanga' => ['Tanga City', 'Tanga Rural'],
                'Morogoro' => ['Morogoro Urban', 'Morogoro Rural'],
                'Mbeya' => ['Mbeya City', 'Mbeya Rural'],
                'Moshi' => ['Moshi Urban', 'Moshi Rural'],
            ];

            foreach ($regions as $regionName => $districts) {
                $regionId = DB::table('regions')->updateOrInsert(
                    ['name' => $regionName],
                    [
                        'name' => $regionName,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
                
                $regionId = DB::table('regions')->where('name', $regionName)->first()->id;
                
                foreach ($districts as $districtName) {
                    DB::table('districts')->updateOrInsert(
                        ['name' => $districtName, 'region_id' => $regionId],
                        [
                            'name' => $districtName,
                            'region_id' => $regionId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                }
            }
            $this->info('✅ Regions and districts created/updated');

            // Create consultation types
            $this->info('8. Creating consultation types...');
            $consultationTypes = [
                ['name' => 'General Consultation', 'description' => 'General eye examination'],
                ['name' => 'Follow-up', 'description' => 'Follow-up consultation'],
                ['name' => 'Emergency', 'description' => 'Emergency consultation'],
                ['name' => 'Surgery Consultation', 'description' => 'Pre-surgery consultation'],
                ['name' => 'Post-surgery', 'description' => 'Post-surgery follow-up'],
                ['name' => 'VIP Consultation', 'description' => 'VIP patient consultation'],
            ];

            foreach ($consultationTypes as $type) {
                DB::table('consultation_types')->updateOrInsert(
                    ['name' => $type['name']],
                    [
                        'name' => $type['name'],
                        'description' => $type['description'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
            $this->info('✅ Consultation types created');

            // Create diseases
            $this->info('9. Creating common eye diseases...');
            $diseases = [
                'Cataract',
                'Glaucoma',
                'Diabetic Retinopathy',
                'Macular Degeneration',
                'Refractive Errors',
                'Conjunctivitis',
                'Dry Eye Syndrome',
                'Blepharitis',
                'Stye',
                'Corneal Abrasion',
                'Retinal Detachment',
                'Uveitis',
                'Keratoconus',
                'Amblyopia',
                'Strabismus',
            ];

            foreach ($diseases as $disease) {
                DB::table('diseases')->updateOrInsert(
                    ['name' => $disease],
                    [
                        'name' => $disease,
                        'description' => 'Eye condition: ' . $disease,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
            $this->info('✅ Diseases created');

            // Create comprehensive preferences
            $this->info('10. Creating comprehensive system preferences...');
            $preferences = [
                ['key' => 'CLINIC_NAME', 'value' => 'Best Vision Eye Care'],
                ['key' => 'CLINIC_PHONE', 'value' => '0678110376'],
                ['key' => 'CLINIC_EMAIL', 'value' => 'info@bestvision.com'],
                ['key' => 'CLINIC_ADDRESS', 'value' => 'Natta, Mwanza'],
                ['key' => 'SYSTEM_VERSION', 'value' => '1.0.0'],
                ['key' => 'MAINTENANCE_MODE', 'value' => 'No'],
                ['key' => 'DEFAULT_CURRENCY', 'value' => 'TZS'],
                ['key' => 'TIMEZONE', 'value' => 'Africa/Dar_es_Salaam'],
                ['key' => 'DATE_FORMAT', 'value' => 'Y-m-d'],
                ['key' => 'TIME_FORMAT', 'value' => 'H:i:s'],
                ['key' => 'PATIENT_ID_PREFIX', 'value' => 'PAT'],
                ['key' => 'CONSULTATION_ID_PREFIX', 'value' => 'CON'],
                ['key' => 'SMS_ENABLED', 'value' => 'Yes'],
                ['key' => 'EMAIL_ENABLED', 'value' => 'Yes'],
                ['key' => 'BACKUP_ENABLED', 'value' => 'Yes'],
            ];

            foreach ($preferences as $pref) {
                DB::table('preferences')->updateOrInsert(
                    ['key' => $pref['key']],
                    [
                        'key' => $pref['key'],
                        'value' => $pref['value'],
                    ]
                );
            }
            $this->info('✅ System preferences created/updated');

            // Create sample patients for testing
            $this->info('11. Creating sample patients...');
            $samplePatients = [
                [
                    'first_name' => 'John',
                    'last_name' => 'Doe',
                    'gender' => 'Male',
                    'phone' => '0712345678',
                    'address' => 'Dar es Salaam',
                    'occupation' => 'Teacher',
                ],
                [
                    'first_name' => 'Jane',
                    'last_name' => 'Smith',
                    'gender' => 'Female',
                    'phone' => '0756789012',
                    'address' => 'Mwanza',
                    'occupation' => 'Nurse',
                ],
                [
                    'first_name' => 'Michael',
                    'last_name' => 'Johnson',
                    'gender' => 'Male',
                    'phone' => '0734567890',
                    'address' => 'Arusha',
                    'occupation' => 'Engineer',
                ],
            ];

            $paymentModeId = DB::table('payment_modes')->where('name', 'Cash')->first()->id;
            $infoSourceId = DB::table('information_sources')->where('name', 'Walk-in')->first()->id;

            foreach ($samplePatients as $patient) {
                DB::table('patients')->insert([
                    'first_name' => $patient['first_name'],
                    'last_name' => $patient['last_name'],
                    'gender' => $patient['gender'],
                    'phone' => $patient['phone'],
                    'address' => $patient['address'],
                    'occupation' => $patient['occupation'],
                    'payment_mode_id' => $paymentModeId,
                    'info_source_id' => $infoSourceId,
                    'created_by' => 1, // Admin
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $this->info('✅ Sample patients created');

            $this->newLine();
            $this->info('=== COMPLETE SYSTEM SETUP FINISHED ===');
            $this->info('✅ All necessary data has been created');
            $this->info('✅ System is now fully functional');
            $this->newLine();
            $this->info('You should now see all menus and pages when you login.');
            $this->info('Login with: admin / admin');

            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error during setup: ' . $e->getMessage());
            $this->error('Stack trace:');
            $this->error($e->getTraceAsString());
            return 1;
        }
    }
}
