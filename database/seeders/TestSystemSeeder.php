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

class TestSystemSeeder extends Seeder
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

        // Create admin user
        User::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@polyclinic-hms.com',
            'username' => 'john_doe',
            'password' => bcrypt('password123'),
            'role' => 'Admin',
            'department_id' => 1, // Reception department
            'status' => 'Active',
            'employee_number' => 'ADMIN001',
            'date_of_birth' => '1985-06-15',
            'gender' => 'Male',
            'phone' => '+255123456789',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create director user
        User::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@polyclinic-hms.com',
            'username' => 'jane_smith',
            'password' => bcrypt('password123'),
            'role' => 'Client',
            'department_id' => 1, // Reception department
            'status' => 'Active',
            'employee_number' => 'DIR001',
            'date_of_birth' => '1978-03-20',
            'gender' => 'Female',
            'phone' => '+255123456780',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create receptionist user
        User::create([
            'first_name' => 'Alice',
            'last_name' => 'Johnson',
            'email' => 'alice.johnson@polyclinic-hms.com',
            'username' => 'alice_johnson',
            'password' => bcrypt('password123'),
            'role' => 'Client',
            'department_id' => 1, // Reception department
            'status' => 'Active',
            'employee_number' => 'REC001',
            'date_of_birth' => '1990-08-25',
            'gender' => 'Female',
            'phone' => '+255123456701',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create cashier user
        User::create([
            'first_name' => 'Michael',
            'last_name' => 'Brown',
            'email' => 'michael.brown@polyclinic-hms.com',
            'username' => 'michael_brown',
            'password' => bcrypt('password123'),
            'role' => 'Client',
            'department_id' => 2, // Cashier department
            'status' => 'Active',
            'employee_number' => 'CASH001',
            'date_of_birth' => '1982-11-30',
            'gender' => 'Male',
            'phone' => '+255123456345',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create doctor user
        User::create([
            'first_name' => 'Dr. Robert',
            'last_name' => 'Williams',
            'email' => 'robert.williams@polyclinic-hms.com',
            'username' => 'dr_williams',
            'password' => bcrypt('password123'),
            'role' => 'Client',
            'department_id' => 3, // Consultation Room department
            'status' => 'Active',
            'employee_number' => 'DOC001',
            'date_of_birth' => '1973-07-10',
            'gender' => 'Male',
            'phone' => '+255123456890',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create pharmacist user
        User::create([
            'first_name' => 'Sarah',
            'last_name' => 'Miller',
            'email' => 'sarah.miller@polyclinic-hms.com',
            'username' => 'sarah_miller',
            'password' => bcrypt('password123'),
            'role' => 'Client',
            'department_id' => 4, // Pharmacy department
            'status' => 'Active',
            'employee_number' => 'PHARM001',
            'date_of_birth' => '1988-04-12',
            'gender' => 'Female',
            'phone' => '+255123456234',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create optician user
        User::create([
            'first_name' => 'David',
            'last_name' => 'Taylor',
            'email' => 'david.taylor@polyclinic-hms.com',
            'username' => 'david_taylor',
            'password' => bcrypt('password123'),
            'role' => 'Client',
            'department_id' => 5, // Optician Center department
            'status' => 'Active',
            'employee_number' => 'OPT001',
            'date_of_birth' => '1991-09-18',
            'gender' => 'Male',
            'phone' => '+255123456567',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create marketing user
        User::create([
            'first_name' => 'Emily',
            'last_name' => 'Clark',
            'email' => 'emily.clark@polyclinic-hms.com',
            'username' => 'emily_clark',
            'password' => bcrypt('password123'),
            'role' => 'Client',
            'department_id' => 5, // Marketing department
            'status' => 'Active',
            'employee_number' => 'MKT001',
            'date_of_birth' => '1992-05-08',
            'gender' => 'Female',
            'phone' => '+255123456890',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create HR user
        User::create([
            'first_name' => 'James',
            'last_name' => 'Wilson',
            'email' => 'james.wilson@polyclinic-hms.com',
            'username' => 'james_wilson',
            'password' => bcrypt('password123'),
            'role' => 'Client',
            'department_id' => 7, // Employee Management department
            'status' => 'Active',
            'employee_number' => 'HR001',
            'date_of_birth' => '1980-02-20',
            'gender' => 'Male',
            'phone' => '+255123456123',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create IT user
        User::create([
            'first_name' => 'Kevin',
            'last_name' => 'Anderson',
            'email' => 'kevin.anderson@polyclinic-hms.com',
            'username' => 'kevin_anderson',
            'password' => bcrypt('password123'),
            'role' => 'Client',
            'department_id' => 8, // IT department
            'status' => 'Active',
            'employee_number' => 'IT001',
            'date_of_birth' => '1993-07-15',
            'gender' => 'Male',
            'phone' => '+255123456456',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

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
                'created_by' => 1, // Admin user ID
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
        $this->command->info('  - Users: 2 users (Admin + Test)');
        $this->command->info('  - Patients: ' . count($patients) . ' patients');
        $this->command->info('  - Consultations: ' . count($consultations) . ' consultations');
        $this->command->info('  - Payments: ' . count($payments) . ' payments');
        $this->command->info('  - Expenses: ' . count($expenses) . ' expenses');
        $this->command->info('Database: polyclinic (XAMPP ready)');
    }
}
