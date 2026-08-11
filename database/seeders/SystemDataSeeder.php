<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Patient;
use App\Models\PatientCheckIn;
use App\Models\PatientItemBill;
use App\Models\PatientItemBillPayment;
use App\Models\PatientItemPayment;
use App\Models\Consultation;
use App\Models\Department;
use App\Models\Item;
use App\Models\ExpensePayment;
use App\Models\Expense;
use App\Models\PaymentChannel;
use App\Models\PatientCallingStatus;
use App\Models\UserPrivilege;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SystemDataSeeder extends Seeder
{
    /**
     * Create sample data for testing and demonstration
     */
    public function run()
    {
        // Create sample departments
        $departments = [
            ['name' => 'Reception', 'description' => 'Patient Registration and Initial Consultation'],
            ['name' => 'Cashier', 'description' => 'Payment Processing and Cash Management'],
            ['name' => 'Consultation Room', 'description' => 'Medical Consultations and Diagnoses'],
            ['name' => 'Optician Center', 'description' => 'Optical Services and Frame Fitting'],
            ['name' => 'Pharmacy', 'description' => 'Medicine Center and Dispensing'],
            ['name' => 'Marketing', 'description' => 'Marketing Activities and Campaigns'],
            ['name' => 'Financial Management', 'description' => 'Financial Reports and Budget Management'],
            ['name' => 'Employee Management', 'description' => 'Staff Management and HR Operations'],
            ['name' => 'IT', 'description' => 'System Administration and Technical Support'],
        ];

        foreach ($departments as $department) {
            Department::updateOrCreate(
                ['name' => $department['name']],
                [
                    'description' => $department['description'],
                    'status' => 'Active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // Create sample users with different roles
        $roles = [
            ['name' => 'Admin', 'email' => 'admin@polyclinic-hms.com', 'password' => bcrypt('password123'), 'is_admin' => true],
            ['name' => 'Client', 'email' => 'director@polyclinic-hms.com', 'password' => bcrypt('password123'), 'is_admin' => false],
            ['name' => 'Client', 'email' => 'reception@polyclinic-hms.com', 'password' => bcrypt('password123'), 'is_admin' => false],
            ['name' => 'Client', 'email' => 'cashier@polyclinic-hms.com', 'password' => bcrypt('password123'), 'is_admin' => false],
            ['name' => 'Client', 'email' => 'doctor@polyclinic-hms.com', 'password' => bcrypt('password123'), 'is_admin' => false],
            ['name' => 'Client', 'email' => 'pharmacist@polyclinic-hms.com', 'password' => bcrypt('password123'), 'is_admin' => false],
            ['name' => 'Client', 'email' => 'optician@polyclinic-hms.com', 'password' => bcrypt('password123'), 'is_admin' => false],
            ['name' => 'Client', 'email' => 'sales@polyclinic-hms.com', 'password' => bcrypt('password123'), 'is_admin' => false],
            ['name' => 'Client', 'email' => 'marketing@polyclinic-hms.com', 'password' => bcrypt('password123'), 'is_admin' => false],
            ['name' => 'Client', 'email' => 'hr@polyclinic-hms.com', 'password' => bcrypt('password123'), 'is_admin' => false],
            ['name' => 'Client', 'email' => 'it@polyclinic-hms.com', 'password' => bcrypt('password123'), 'is_admin' => false],
            ['name' => 'Client', 'email' => 'test@polyclinic-hms.com', 'password' => bcrypt('password123'), 'is_admin' => false, 'is_test_user' => true], // Test user for deletion
        ];

        // Create unique usernames
        $usernames = ['admin', 'director', 'reception', 'cashier', 'doctor', 'pharmacist', 'optician', 'sales', 'marketing', 'hr', 'it', 'test'];
        
        foreach ($roles as $index => $role) {
            // Find department ID for role
            $roleId = 1;
            foreach ($departments as $deptIndex => $dept) {
                if ($dept['name'] === $role['name']) {
                    $roleId = $deptIndex + 1;
                    break;
                }
            }
            
            // Find marketing department ID
            $marketingDeptId = 5;
            foreach ($departments as $deptIndex => $dept) {
                if ($dept['name'] === 'Marketing') {
                    $marketingDeptId = $deptIndex + 1;
                    break;
                }
            }
            
            User::create([
                'first_name' => 'Test',
                'last_name' => 'User',
                'email' => $role['email'],
                'username' => $usernames[$index],
                'password' => bcrypt('password123'),
                'role' => $role['name'],
                'department_id' => $marketingDeptId,
                'status' => 'Active',
                'employee_number' => 'TEST001',
                'date_of_birth' => '1990-01-01',
                'gender' => 'Male',
                'phone' => '+2551234567',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Create sample patients
        $patients = [];
        for ($i = 1; $i <= 20; $i++) {
            $patients[] = [
                'first_name' => "Patient {$i}",
                'last_name' => "Doe {$i}",
                'phone' => "+255123456{$i}",
                'gender' => $i % 2 === 0 ? 'Male' : 'Female',
                'date_of_birth' => '198' . rand(1, 12) . '-01',
                'created_at' => Carbon::now()->subDays(rand(1, 365)),
                'status' => 'Active',
            ];
        }

        // Create sample consultations
        $consultations = [];
        foreach ($patients as $patient) {
            $consultations[] = [
                'patient_id' => $patient['id'],
                'consultation_date' => Carbon::now()->subDays(rand(1, 30)),
                'status' => 'Completed',
                'doctor_id' => array_search($roles, 'name', 'Doctor')[0]['id'] ?? 3,
                'sent_to_optician_at' => Carbon::now()->subDays(rand(1, 7)),
                'patient_direction' => 'Sent to Optician',
                'created_by' => array_search($roles, 'name', 'Doctor')[0]['id'] ?? 3,
                'updated_at' => Carbon::now(),
            ];
        }

        // Create sample payments
        $payments = [];
        foreach ($patients as $index => $patient) {
            $payments[] = [
                'patient_id' => $patient['id'],
                'amount' => rand(50000, 500000),
                'payment_method' => ['cash', 'mobile_money', 'card'][array_rand(['cash', 'mobile_money', 'card'])],
                'payment_date' => Carbon::now()->subDays(rand(1, 30)),
                'created_by' => array_search($roles, 'name', 'Cashier')[0]['id'] ?? 2,
                'created_at' => Carbon::now(),
            ];
        }

        // Create sample expenses
        $expenses = [];
        for ($i = 1; $i <= 10; $i++) {
            $expenses[] = [
                'description' => "Office Expense {$i}",
                'amount' => rand(10000, 100000),
                'category' => ['office', 'utilities', 'marketing'][array_rand(['office', 'utilities', 'marketing'])],
                'created_by' => array_search($roles, 'name', 'Admin')[0]['id'] ?? 1,
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
            ];
        }

        // Insert all data
        $createdPatients = [];
        foreach ($patients as $patient) {
            $createdPatient = Patient::create($patient);
            $createdPatients[] = $createdPatient->id;
        }

        foreach ($createdPatients as $patientId) {
            $consultations[] = [
                'patient_id' => $patientId,
                'consultation_date' => Carbon::now()->subDays(rand(1, 30)),
                'status' => 'Completed',
                'doctor_id' => array_search($roles, 'name', 'Doctor')[0]['id'] ?? 3,
                'sent_to_optician_at' => Carbon::now()->subDays(rand(1, 7)),
                'patient_direction' => 'Sent to Optician',
                'created_by' => array_search($roles, 'name', 'Doctor')[0]['id']] ?? 3,
                'updated_at' => Carbon::now(),
            ];
        }

        foreach ($createdPatients as $patientId) {
            $payments[] = [
                'patient_id' => $patientId,
                'amount' => rand(50000, 500000),
                'payment_method' => ['cash', 'mobile_money', 'card'][array_rand(['cash', 'mobile_money', 'card'])],
                'payment_date' => Carbon::now()->subDays(rand(1, 30)),
                'created_by' => array_search($roles, 'name', 'Cashier')[0]['id']] ?? 2,
                'created_at' => Carbon::now(),
            ];
        }

        foreach ($consultations as $consultation) {
            Consultation::create($consultation);
        }

        foreach ($payments as $payment) {
            PatientItemPayment::create($payment);
        }

        foreach ($expenses as $expense) {
            Expense::create($expense);
        }

        $this->command->info('Sample data created successfully for polyclinic database!');
        $this->command->info('Created:');
        $this->command->info('  - Departments: ' . count($departments) . ' departments');
        $this->command->info('  - Users: ' . count($roles) . ' users');
        $this->command->info('  - Patients: ' . count($patients) . ' patients');
        $this->command->info('  - Consultations: ' . count($consultations) . ' consultations');
        $this->command->info('  - Payments: ' . count($payments) . ' payments');
        $this->command->info('  - Expenses: ' . count($expenses) . ' expenses');
        $this->command->info('  - Test User: 1 (for deletion testing)');
        $this->command->info('Database: polyclinic (XAMPP ready)');
    }
}
