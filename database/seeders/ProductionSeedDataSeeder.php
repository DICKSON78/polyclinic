<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProductionSeedDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear existing data (except patients and sensitive data)
        $this->clearNonSensitiveData();
        
        // Seed essential data
        $this->seedClinics();
        $this->seedDepartments();
        $this->seedUsers();
        $this->seedPrivileges();
        $this->seedJobTitles();
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        $this->command->info('✅ Production seed data completed successfully!');
    }
    
    private function clearNonSensitiveData()
    {
        // Clear only non-sensitive data
        DB::table('user_privileges')->truncate();
        DB::table('users')->where('id', '>', 13)->delete(); // Keep existing users up to ID 13
        DB::table('departments')->where('id', '>', 6)->delete(); // Keep existing departments
    }
    
    private function seedClinics()
    {
        // Ensure main clinic exists
        DB::table('clinics')->updateOrInsert(
            ['id' => 1],
            [
                'name' => 'Polyclinic HMS',
                'phone' => '0676 506 323',
                'email' => 'info@polyclinic-hms.com',
                'address' => 'P. O. Box 95042 DSM',
                'sms_balance' => 642,
                'sms_key' => null,
                'sms_sender_name' => 'INFO',
                'created_at' => now(),
                'updated_at' => now(),
                'logo' => null
            ]
        );
    }
    
    private function seedDepartments()
    {
        $departments = [
            ['id' => 1, 'clinic_id' => 1, 'name' => 'Accounting', 'description' => null, 'status' => 'Active'],
            ['id' => 2, 'clinic_id' => 1, 'name' => 'Workshop', 'description' => null, 'status' => 'Active'],
            ['id' => 3, 'clinic_id' => 1, 'name' => 'Reception', 'description' => null, 'status' => 'Active'],
            ['id' => 4, 'clinic_id' => 1, 'name' => 'Optometry', 'description' => null, 'status' => 'Active'],
            ['id' => 5, 'clinic_id' => 1, 'name' => 'Administration', 'description' => null, 'status' => 'Active'],
            ['id' => 6, 'clinic_id' => null, 'name' => 'Marketing', 'description' => 'Marketing and promotional activities management', 'status' => 'Active'],
        ];
        
        foreach ($departments as $dept) {
            DB::table('departments')->updateOrInsert(
                ['id' => $dept['id']],
                [
                    'clinic_id' => $dept['clinic_id'],
                    'name' => $dept['name'],
                    'description' => $dept['description'],
                    'status' => $dept['status'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }
    }
    
    private function seedUsers()
    {
        // Ensure admin user exists
        DB::table('users')->updateOrInsert(
            ['id' => 13],
            [
                'clinic_id' => 1,
                'first_name' => 'Tech',
                'middle_name' => null,
                'last_name' => 'Admin',
                'designation' => 'Doctor',
                'username' => 'tech',
                'department_id' => 5,
                'job_title_id' => null,
                'employee_number' => null,
                'date_of_birth' => null,
                'gender' => null,
                'national_id' => null,
                'phone' => null,
                'email' => 'tech@polyclinic-hms.com',
                'password' => Hash::make('password123'),
                'role' => 'Admin',
                'api_token' => null,
                'created_at' => now(),
                'created_by' => null,
                'status' => 'Active',
                'updated_at' => now()
            ]
        );
        
        // Add additional demo users if needed
        $demoUsers = [
            [
                'id' => 14,
                'first_name' => 'Sales',
                'last_name' => 'Manager',
                'username' => 'sales_manager',
                'email' => 'sales@polyclinic-hms.com',
                'role' => 'Client',
                'department_id' => 6 // Marketing
            ],
            [
                'id' => 15,
                'first_name' => 'Optometry',
                'last_name' => 'Specialist',
                'username' => 'optometry_specialist',
                'email' => 'optometry@polyclinic-hms.com',
                'role' => 'Client',
                'department_id' => 4 // Optometry
            ]
        ];
        
        foreach ($demoUsers as $user) {
            DB::table('users')->updateOrInsert(
                ['id' => $user['id']],
                [
                    'clinic_id' => 1,
                    'middle_name' => null,
                    'designation' => 'Doctor',
                    'job_title_id' => null,
                    'employee_number' => null,
                    'date_of_birth' => null,
                    'gender' => null,
                    'national_id' => null,
                    'phone' => null,
                    'password' => Hash::make('password123'),
                    'api_token' => null,
                    'created_at' => now(),
                    'created_by' => 13,
                    'status' => 'Active',
                    'updated_at' => now(),
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'department_id' => $user['department_id']
                ]
            );
        }
    }
    
    private function seedPrivileges()
    {
        // Admin user (ID 13) - Full access
        $adminPrivileges = [
            'dashboard',
            'reception',
            'payment_center',
            'consultation_room',
            'optician_center',
            'medicine_center',
            'procedure_room',
            'inventory_management',
            'financial_management',
            'user_management',
            'settings',
            'clear_pending_bill',
            'customer_relationship_management',
            'crm_reports',
            'optometry_reports',
            'sales_reports',
            'marketing_management',
            'sales_management',
            'director',
            'office_calendar',
            'calendar_edit'
        ];
        
        foreach ($adminPrivileges as $privilege) {
            DB::table('user_privileges')->updateOrInsert(
                ['user_id' => 13, 'privilege' => $privilege],
                []
            );
        }
        
        // Sales Manager (ID 14) - Sales and CRM access
        $salesManagerPrivileges = [
            'dashboard',
            'customer_relationship_management',
            'crm_reports',
            'sales_reports',
            'sales_management',
            'marketing_management'
        ];
        
        foreach ($salesManagerPrivileges as $privilege) {
            DB::table('user_privileges')->updateOrInsert(
                ['user_id' => 14, 'privilege' => $privilege],
                []
            );
        }
        
        // Optometry Specialist (ID 15) - Optometry and reception access
        $optometryPrivileges = [
            'dashboard',
            'reception',
            'consultation_room',
            'optician_center',
            'optometry_reports'
        ];
        
        foreach ($optometryPrivileges as $privilege) {
            DB::table('user_privileges')->updateOrInsert(
                ['user_id' => 15, 'privilege' => $privilege],
                []
            );
        }
        
        // Create department performance KPI targets
        $this->seedDepartmentKpiTargets();
    }
    
    private function seedDepartmentKpiTargets()
    {
        $kpiTargets = [
            // Optometry KPIs
            ['department' => 'Optometry', 'kpi_name' => 'Patient Satisfaction', 'target_value' => 95, 'target_unit' => '%'],
            ['department' => 'Optometry', 'kpi_name' => 'Treatment Success Rate', 'target_value' => 90, 'target_unit' => '%'],
            ['department' => 'Optometry', 'kpi_name' => 'Service Quality', 'target_value' => 85, 'target_unit' => '%'],
            ['department' => 'Optometry', 'kpi_name' => 'Appointment Efficiency', 'target_value' => 80, 'target_unit' => '%'],
            
            // Sales KPIs
            ['department' => 'Sales', 'kpi_name' => 'Sales Made', 'target_value' => 50, 'target_unit' => 'count'],
            ['department' => 'Sales', 'kpi_name' => 'Revenue Generated', 'target_value' => 500000, 'target_unit' => 'TZS'],
            ['department' => 'Sales', 'kpi_name' => 'Conversion Rate', 'target_value' => 25, 'target_unit' => '%'],
            ['department' => 'Sales', 'kpi_name' => 'Average Order Value', 'target_value' => 10000, 'target_unit' => 'TZS'],
            ['department' => 'Sales', 'kpi_name' => 'Customer Follow-ups', 'target_value' => 80, 'target_unit' => 'count'],
            ['department' => 'Sales', 'kpi_name' => 'New Customers Acquired', 'target_value' => 15, 'target_unit' => 'count'],
            ['department' => 'Sales', 'kpi_name' => 'Product Knowledge Score', 'target_value' => 85, 'target_unit' => '%'],
            
            // CRM KPIs
            ['department' => 'CRM', 'kpi_name' => 'Lead Conversion Rate', 'target_value' => 20, 'target_unit' => '%'],
            ['department' => 'CRM', 'kpi_name' => 'Customer Satisfaction', 'target_value' => 90, 'target_unit' => '%'],
            ['department' => 'CRM', 'kpi_name' => 'Response Time', 'target_value' => 30, 'target_unit' => 'minutes'],
            ['department' => 'CRM', 'kpi_name' => 'Follow-up Rate', 'target_value' => 75, 'target_unit' => '%'],
        ];
        
        foreach ($kpiTargets as $target) {
            DB::table('department_kpi_targets')->updateOrInsert(
                [
                    'department' => $target['department'],
                    'kpi_name' => $target['kpi_name'],
                    'clinic_id' => 1
                ],
                [
                    'target_value' => $target['target_value'],
                    'target_unit' => $target['target_unit'],
                    'status' => 'Active',
                    'created_by' => 13,
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }
        
        // Create department performance access
        $departmentAccess = [
            ['user_id' => 13, 'department' => 'Optometry'],
            ['user_id' => 13, 'department' => 'Sales'],
            ['user_id' => 13, 'department' => 'CRM'],
            ['user_id' => 14, 'department' => 'Sales'],
            ['user_id' => 14, 'department' => 'CRM'],
            ['user_id' => 15, 'department' => 'Optometry'],
        ];
        
        foreach ($departmentAccess as $access) {
            DB::table('department_performance_access')->updateOrInsert(
                [
                    'user_id' => $access['user_id'],
                    'department' => $access['department'],
                    'clinic_id' => 1
                ],
                []
            );
        }
    }
    
    private function seedJobTitles()
    {
        $jobTitles = [
            ['id' => 1, 'name' => 'Doctor', 'department_id' => 4],
            ['id' => 2, 'name' => 'Nurse', 'department_id' => 4],
            ['id' => 3, 'name' => 'Receptionist', 'department_id' => 3],
            ['id' => 4, 'name' => 'Administrator', 'department_id' => 5],
            ['id' => 5, 'name' => 'Sales Manager', 'department_id' => 6],
            ['id' => 6, 'name' => 'Optometrist', 'department_id' => 4],
        ];
        
        foreach ($jobTitles as $jobTitle) {
            DB::table('job_titles')->updateOrInsert(
                ['id' => $jobTitle['id']],
                [
                    'name' => $jobTitle['name'],
                    'department_id' => $jobTitle['department_id'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }
    }
}
