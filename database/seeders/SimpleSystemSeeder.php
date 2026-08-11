<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Patient;
use App\Models\Consultation;
use App\Models\PatientItemPayment;
use App\Models\Expense;
use App\Models\Department;
use Carbon\Carbon;

class SimpleSystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        echo "Creating sample data for Polyclinic HMS system...\n";

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

        // Create sample users
        $roles = [
            ['name' => 'Admin', 'email' => 'admin@polyclinic-hms.com', 'password' => bcrypt('password123')],
            ['name' => 'Client', 'email' => 'director@polyclinic-hms.com', 'password' => bcrypt('password123')],
            ['name' => 'Client', 'email' => 'reception@polyclinic-hms.com', 'password' => bcrypt('password123')],
            ['name' => 'Client', 'email' => 'cashier@polyclinic-hms.com', 'password' => bcrypt('password123')],
            ['name' => 'Client', 'email' => 'doctor@polyclinic-hms.com', 'password' => bcrypt('password123')],
            ['name' => 'Client', 'email' => 'pharmacist@polyclinic-hms.com', 'password' => bcrypt('password123')],
            ['name' => 'Client', 'email' => 'optician@polyclinic-hms.com', 'password' => bcrypt('password123')],
            ['name' => 'Client', 'email' => 'sales@polyclinic-hms.com', 'password' => bcrypt('password123')],
            ['name' => 'Client', 'email' => 'marketing@polyclinic-hms.com', 'password' => bcrypt('password123')],
            ['name' => 'Client', 'email' => 'hr@polyclinic-hms.com', 'password' => bcrypt('password123')],
            ['name' => 'Client', 'email' => 'it@polyclinic-hms.com', 'password' => bcrypt('password123')],
        ];

        foreach ($roles as $index => $role) {
            User::create([
                'first_name' => 'Test',
                'last_name' => 'User',
                'email' => $role['email'],
                'username' => 'test_user_' . $index,
                'password' => bcrypt('password123'),
                'role' => $role['name'],
                'department_id' => 5, // Marketing department
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
                'date_of_birth' => '1980-01-01',
                'created_at' => Carbon::now()->subDays(rand(1, 365)),
                'status' => 'Active',
            ];
        }

        foreach ($patients as $patient) {
            Patient::create($patient);
        }

        // Create sample consultations
        $consultations = [];
        foreach ($patients as $patient) {
            $consultations[] = [
                'patient_id' => $patient->id,
                'consultation_date' => Carbon::now()->subDays(rand(1, 30)),
                'status' => 'Completed',
                'created_by' => 3, // Doctor user ID
                'updated_at' => Carbon::now(),
            ];
        }

        foreach ($consultations as $consultation) {
            Consultation::create($consultation);
        }

        // Create sample payments
        $payments = [];
        foreach ($patients as $patient) {
            $payments[] = [
                'patient_id' => $patient->id,
                'amount' => rand(50000, 500000),
                'payment_method' => ['cash', 'mobile_money', 'card'][array_rand(['cash', 'mobile_money', 'card'])],
                'payment_date' => Carbon::now()->subDays(rand(1, 30)),
                'created_by' => 2, // Cashier user ID
                'created_at' => Carbon::now(),
            ];
        }

        foreach ($payments as $payment) {
            PatientItemPayment::create($payment);
        }

        // Create sample expenses
        $expenses = [];
        for ($i = 1; $i <= 10; $i++) {
            $expenses[] = [
                'description' => "Office Expense {$i}",
                'amount' => rand(10000, 100000),
                'category' => ['office', 'utilities', 'marketing'][array_rand(['office', 'utilities', 'marketing'])],
                'created_by' => 1, // Admin user ID
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
            ];
        }

        foreach ($expenses as $expense) {
            Expense::create($expense);
        }

        $this->command->info('Sample data created successfully!');
        $this->command->info('Created:');
        $this->command->info('  - Departments: ' . count($departments) . ' departments');
        $this->command->info('  - Users: ' . count($roles) . ' users');
        $this->command->info('  - Patients: ' . count($patients) . ' patients');
        $this->command->info('  - Consultations: ' . count($consultations) . ' consultations');
        $this->command->info('  - Payments: ' . count($payments) . ' payments');
        $this->command->info('  - Expenses: ' . count($expenses) . ' expenses');
        $this->command->info('Database: polyclinic (XAMPP ready)');
    }
}
