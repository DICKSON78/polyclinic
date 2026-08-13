<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Clinic;
use App\Models\ConsultationType;
use App\Models\ItemType;
use App\Models\JobTitle;
use App\Models\PaymentChannel;
use App\Models\PaymentMode;
use App\Models\Preference;
use App\Models\UnitOfMeasure;
use App\Models\User;
use App\Models\UserPrivilege;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->seedBaseData();

        $this->call([
            ComprehensiveClinicalDataSeeder::class,
            SampleTransactionalDataSeeder::class,
            DashboardDataSeeder::class,
        ]);
    }

    private function seedBaseData()
    {
        $now = Carbon::now()->toDateTimeString();

        Clinic::insert([
            [
                'name' => 'SmartSoft Clinic',
                'phone' => '076855364',
                'email' => 'smartsoft@gmail.com',
                'address' => 'P. O. Box 879 DSM',
                'created_at' => $now,
                'updated_at' => $now
            ],
        ]);

        JobTitle::insertOrIgnore([
            ['clinic_id' => 1, 'name' => 'Receptionist', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Doctor', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Cashier', 'created_at' => $now, 'updated_at' => $now],
        ]);

        User::insertOrIgnore([
            [
                'clinic_id' => 1,
                'first_name' => 'Admin',
                'last_name' => 'Admin',
                'username' => 'admin',
                'role' => 'Admin',
                'password' => Hash::make('1234'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // Add doctor users
        User::insertOrIgnore([
            [
                'clinic_id' => 1,
                'first_name' => 'John',
                'last_name' => 'Doe',
                'role' => 'Doctor',
                'designation' => 'General Physician',
                'username' => 'doctor1',
                'password' => Hash::make('1234'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'role' => 'Doctor',
                'designation' => 'Ophthalmologist',
                'username' => 'doctor2',
                'password' => Hash::make('1234'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Michael',
                'last_name' => 'Johnson',
                'role' => 'Doctor',
                'designation' => 'Optometrist',
                'username' => 'doctor3',
                'password' => Hash::make('1234'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // Add receptionist user
        User::insertOrIgnore([
            [
                'clinic_id' => 1,
                'first_name' => 'Sarah',
                'last_name' => 'Williams',
                'role' => 'Receptionist',
                'designation' => 'Front Desk',
                'username' => 'receptionist1',
                'password' => Hash::make('1234'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // Add cashier user
        User::insertOrIgnore([
            [
                'clinic_id' => 1,
                'first_name' => 'James',
                'last_name' => 'Brown',
                'role' => 'Cashier',
                'designation' => 'Payment Center',
                'username' => 'cashier1',
                'password' => Hash::make('1234'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // Add nurse user
        User::insertOrIgnore([
            [
                'clinic_id' => 1,
                'first_name' => 'Emily',
                'last_name' => 'Davis',
                'role' => 'Nurse',
                'designation' => 'Triage',
                'username' => 'nurse1',
                'password' => Hash::make('1234'),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        UserPrivilege::insertOrIgnore([
            ['user_id' => 1, 'privilege' => 'dashboard'],
            ['user_id' => 1, 'privilege' => 'reception'],
            ['user_id' => 1, 'privilege' => 'triage'],
            ['user_id' => 1, 'privilege' => 'payment_center'],
            ['user_id' => 1, 'privilege' => 'consultation_room'],
            ['user_id' => 1, 'privilege' => 'optician_center'],
            ['user_id' => 1, 'privilege' => 'medicine_center'],
            ['user_id' => 1, 'privilege' => 'procedure_room'],
            ['user_id' => 1, 'privilege' => 'other_dispensing'],
            ['user_id' => 1, 'privilege' => 'inventory_management'],
            ['user_id' => 1, 'privilege' => 'marketing'],
            ['user_id' => 1, 'privilege' => 'financial_management'],
            ['user_id' => 1, 'privilege' => 'user_management'],
            ['user_id' => 1, 'privilege' => 'settings'],
            ['user_id' => 1, 'privilege' => 'laboratory'],
            ['user_id' => 1, 'privilege' => 'radiology'],
            ['user_id' => 1, 'privilege' => 'wards'],
            ['user_id' => 1, 'privilege' => 'e_prescription'],
            ['user_id' => 1, 'privilege' => 'appointments'],
        ]);

        ConsultationType::insertOrIgnore([
            ['name' => 'General Consultation', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Follow-up', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Emergency', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Specialist', 'created_at' => $now, 'updated_at' => $now],
        ]);

        PaymentMode::insertOrIgnore(['clinic_id' => 1, 'name' => 'Cash', 'transaction_type' => 'Cash', 'created_at' => $now, 'updated_at' => $now]);

        // Create default payment channels
        PaymentChannel::insertOrIgnore([
            ['clinic_id' => 1, 'name' => 'Cash', 'description' => 'Cash payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Credit', 'description' => 'Credit payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Bank Transfer', 'description' => 'Bank transfer payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        UnitOfMeasure::insertOrIgnore([
            ['name' => 'mg', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Btl', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'PC', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Tube', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Kit', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Box', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ltr', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Cap', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Tin', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Amp', 'created_at' => $now, 'updated_at' => $now],
        ]);

        ItemType::insertOrIgnore([
            ['name' => 'Service', 'description' => 'Serviced Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Pharmaceutical', 'description' => 'Pharmaceutical and Consumable Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Laboratory', 'description' => 'Laboratory Test Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Radiology', 'description' => 'Radiology/Imaging Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Others', 'description' => 'Other Item', 'created_at' => $now, 'updated_at' => $now],
        ]);

        \App\Models\LabTest::insertOrIgnore([
            ['clinic_id' => 1, 'name' => 'Complete Blood Count', 'code' => 'CBC', 'category' => 'Hematology', 'specimen_type' => 'Blood', 'unit' => 'cells/µL', 'reference_range' => '4.5-11.0', 'price' => 15000, 'turnaround_time' => 2, 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Random Blood Sugar', 'code' => 'RBS', 'category' => 'Chemistry', 'specimen_type' => 'Blood', 'unit' => 'mmol/L', 'reference_range' => '3.9-7.8', 'price' => 8000, 'turnaround_time' => 1, 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Urinalysis', 'code' => 'U/A', 'category' => 'Chemistry', 'specimen_type' => 'Urine', 'unit' => null, 'reference_range' => null, 'price' => 12000, 'turnaround_time' => 3, 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Malaria Test', 'code' => 'MAL', 'category' => 'Parasitology', 'specimen_type' => 'Blood', 'unit' => null, 'reference_range' => null, 'price' => 10000, 'turnaround_time' => 1, 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Blood Group & Rh', 'code' => 'BGR', 'category' => 'Immunohematology', 'specimen_type' => 'Blood', 'unit' => null, 'reference_range' => null, 'price' => 10000, 'turnaround_time' => 1, 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'HIV Rapid Test', 'code' => 'HIV', 'category' => 'Serology', 'specimen_type' => 'Blood', 'unit' => null, 'reference_range' => null, 'price' => 12000, 'turnaround_time' => 1, 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        \App\Models\Medicine::insertOrIgnore([
            ['clinic_id' => 1, 'name' => 'Paracetamol 500mg', 'code' => 'PARA500', 'item_type_id' => 2, 'consultation_type_id' => 1, 'unit_of_measure_id' => 3, 'is_consultation_item' => 'No', 'is_stock_item' => 'Yes', 'balance' => 500, 'new_balance' => 500, 'unit_buying_price' => 50, 'minimum_stock' => 50, 'has_expiry' => 'No', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Amoxicillin 250mg Capsules', 'code' => 'AMOX250', 'item_type_id' => 2, 'consultation_type_id' => 1, 'unit_of_measure_id' => 8, 'is_consultation_item' => 'No', 'is_stock_item' => 'Yes', 'balance' => 300, 'new_balance' => 300, 'unit_buying_price' => 80, 'minimum_stock' => 40, 'has_expiry' => 'No', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'ORS Sachets', 'code' => 'ORS', 'item_type_id' => 2, 'consultation_type_id' => 1, 'unit_of_measure_id' => 3, 'is_consultation_item' => 'No', 'is_stock_item' => 'Yes', 'balance' => 200, 'new_balance' => 200, 'unit_buying_price' => 30, 'minimum_stock' => 30, 'has_expiry' => 'No', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Ciprofloxacin 500mg', 'code' => 'CIPRO500', 'item_type_id' => 2, 'consultation_type_id' => 1, 'unit_of_measure_id' => 3, 'is_consultation_item' => 'No', 'is_stock_item' => 'Yes', 'balance' => 150, 'new_balance' => 150, 'unit_buying_price' => 120, 'minimum_stock' => 20, 'has_expiry' => 'No', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Metronidazole 400mg', 'code' => 'MET400', 'item_type_id' => 2, 'consultation_type_id' => 1, 'unit_of_measure_id' => 3, 'is_consultation_item' => 'No', 'is_stock_item' => 'Yes', 'balance' => 250, 'new_balance' => 250, 'unit_buying_price' => 60, 'minimum_stock' => 25, 'has_expiry' => 'No', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        \App\Models\RadiologyExam::insertOrIgnore([
            ['clinic_id' => 1, 'name' => 'Chest X-Ray', 'code' => 'CXR', 'category' => 'X-Ray', 'preparation' => null, 'description' => null, 'price' => 25000, 'turnaround_time' => 1, 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Abdominal Ultrasound', 'code' => 'AUS', 'category' => 'Ultrasound', 'preparation' => 'Fasting for 6 hours recommended', 'description' => null, 'price' => 35000, 'turnaround_time' => 1, 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'CT Scan of Head', 'code' => 'CTH', 'category' => 'CT Scan', 'preparation' => null, 'description' => null, 'price' => 120000, 'turnaround_time' => 2, 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Pelvic Ultrasound', 'code' => 'PUS', 'category' => 'Ultrasound', 'preparation' => null, 'description' => null, 'price' => 30000, 'turnaround_time' => 1, 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Limb X-Ray', 'code' => 'LXR', 'category' => 'X-Ray', 'preparation' => null, 'description' => null, 'price' => 20000, 'turnaround_time' => 1, 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        \App\Models\HospitalWard::insertOrIgnore([
            ['clinic_id' => 1, 'name' => 'General Ward', 'code' => 'GW', 'ward_type' => 'General', 'floor' => 'Ground Floor', 'bed_capacity' => 6, 'price_per_day' => 15000, 'description' => 'General medical and surgical admissions', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Maternity Ward', 'code' => 'MW', 'ward_type' => 'Maternity', 'floor' => 'Ground Floor', 'bed_capacity' => 4, 'price_per_day' => 25000, 'description' => 'Obstetric and postnatal care', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Pediatric Ward', 'code' => 'PW', 'ward_type' => 'Pediatric', 'floor' => 'First Floor', 'bed_capacity' => 4, 'price_per_day' => 18000, 'description' => 'Care for children and infants', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Private Ward', 'code' => 'PVW', 'ward_type' => 'Private', 'floor' => 'Second Floor', 'bed_capacity' => 2, 'price_per_day' => 50000, 'description' => 'Private rooms for individual patients', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        \App\Models\Bed::insertOrIgnore([
            ['clinic_id' => 1, 'hospital_ward_id' => 1, 'bed_number' => 'G-1', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 1, 'bed_number' => 'G-2', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 1, 'bed_number' => 'G-3', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 1, 'bed_number' => 'G-4', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 1, 'bed_number' => 'G-5', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 1, 'bed_number' => 'G-6', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 2, 'bed_number' => 'M-1', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 2, 'bed_number' => 'M-2', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 2, 'bed_number' => 'M-3', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 2, 'bed_number' => 'M-4', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 3, 'bed_number' => 'P-1', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 3, 'bed_number' => 'P-2', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 3, 'bed_number' => 'P-3', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 3, 'bed_number' => 'P-4', 'bed_type' => 'Regular', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 4, 'bed_number' => 'PV-1', 'bed_type' => 'Private', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'hospital_ward_id' => 4, 'bed_number' => 'PV-2', 'bed_type' => 'Private', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
        ]);

        Preference::insertOrIgnore([
            ['clinic_id' => 1, 'key' => 'CONSULTATION_MESSAGE', 'value' => 'Habari {name}, Hongera na asante kwa kupata huduma kwetu. Ni tumaini letu umepata huduma stahiki. Kwa maoni kuhusu huduma zetu tuma ujumbe au piga simu namba 0676 506 323. Karibu sana.'],
            ['clinic_id' => 1, 'key' => 'PATIENT_TO_RETURN_REMINDER_MESSAGE', 'value' => 'Habari {name}, Tunakukumbusha kurudi kumuona daktari kesho tarehe {date} kwa ajili ya vipimo ili kufuatilia maendeleo ya afya yako. Wasiliana nasi 0676 506 323.'],
            ['clinic_id' => 1, 'key' => 'SEND_MESSAGES', 'value' => 'No'],
            ['clinic_id' => 1, 'key' => 'SEND_REMINDER_MESSAGES_AT', 'value' => '11:00'],
            ['clinic_id' => 1, 'key' => 'SMS_SENDER_NAME', 'value' => 'INFO'],
            ['clinic_id' => 1, 'key' => 'MARKETING_MODULE', 'value' => 'Yes'],
        ]);

        // Add sample patients
        \App\Models\Patient::insertOrIgnore([
            [
                'clinic_id' => 1,
                'first_name' => 'Alice',
                'last_name' => 'Johnson',
                'phone' => '0712345678',
                'gender' => 'Female',
                'date_of_birth' => '1985-03-15',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Bob',
                'last_name' => 'Williams',
                'phone' => '0723456789',
                'gender' => 'Male',
                'date_of_birth' => '1978-07-22',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Carol',
                'last_name' => 'Brown',
                'phone' => '0734567890',
                'gender' => 'Female',
                'date_of_birth' => '1992-11-08',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'David',
                'last_name' => 'Davis',
                'phone' => '0745678901',
                'gender' => 'Male',
                'date_of_birth' => '1980-05-12',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // Add sample doctor tasks
        \App\Models\DoctorTask::insertOrIgnore([
            [
                'doctor_id' => 2, // Dr. John Doe
                'patient_id' => 1, // Alice Johnson
                'task_type' => 'Consultation',
                'treatment_details' => 'General consultation and examination',
                'status' => 'completed',
                'assigned_at' => now()->subDays(2),
                'started_at' => now()->subDays(2)->addMinutes(30),
                'completed_at' => now()->subDays(2)->addMinutes(45),
                'assigned_by' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'doctor_id' => 2, // Dr. John Doe
                'patient_id' => 2, // Bob Williams
                'task_type' => 'Procedure',
                'treatment_details' => 'Wound dressing and treatment',
                'status' => 'in_progress',
                'assigned_at' => now()->subHours(2),
                'started_at' => now()->subHour(),
                'completed_at' => null,
                'assigned_by' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'doctor_id' => 3, // Dr. Jane Smith
                'patient_id' => 3, // Carol Brown
                'task_type' => 'Follow-up',
                'treatment_details' => 'Post-treatment follow-up examination',
                'status' => 'pending',
                'assigned_at' => now()->addHours(1),
                'started_at' => null,
                'completed_at' => null,
                'assigned_by' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'doctor_id' => 4, // Dr. Michael Johnson
                'patient_id' => 4, // David Davis
                'task_type' => 'Consultation',
                'treatment_details' => 'Routine health check-up',
                'status' => 'completed',
                'assigned_at' => now()->subDays(1),
                'started_at' => now()->subDays(1)->addMinutes(15),
                'completed_at' => now()->subDays(1)->addMinutes(30),
                'assigned_by' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'doctor_id' => 3, // Dr. Jane Smith
                'patient_id' => 1, // Alice Johnson
                'task_type' => 'Procedure',
                'treatment_details' => 'Minor surgical procedure',
                'status' => 'pending',
                'assigned_at' => now()->addDays(1),
                'started_at' => null,
                'completed_at' => null,
                'assigned_by' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
