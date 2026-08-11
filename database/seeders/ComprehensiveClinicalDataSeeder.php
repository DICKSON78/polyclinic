<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\ExpenseCategory;
use App\Models\ItemPrice;
use App\Models\Occupation;
use App\Models\Region;
use App\Models\District;
use App\Models\Marketing\InformationSource;
use App\Models\InsuranceCompany;
use App\Models\OperatingTheatre;
use App\Models\AmbulanceVehicle;
use App\Models\Ward;
use App\Models\AnesthesiaRecord;
use App\Models\AnesthesiaVital;
use App\Models\BloodBankUnit;
use App\Models\BloodDonor;
use App\Models\MortuaryBody;
use App\Models\DeathCertificate;
use App\Models\Admission;
use App\Models\InpatientNote;
use App\Models\NursingChart;
use App\Models\FluidBalance;
use App\Models\MarEntry;
use App\Models\DischargeSummary;
use App\Models\Surgery;
use App\Models\SurgicalNote;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\ErVisit;
use App\Models\LabRequest;
use App\Models\LabRequestTest;
use App\Models\RadiologyRequest;
use App\Models\RadiologyRequestExam;
use App\Models\AmbulanceRequest;
use App\Models\AmbulanceTrip;
use App\Models\InpatientBill;
use App\Models\InpatientCharge;
use App\Models\InpatientBillPayment;
use App\Models\InsuranceClaim;
use App\Models\InsuranceClaimItem;
use App\Models\PatientInsurance;
use App\Models\VitalSign;
use App\Models\PatientCheckIn;
use App\Models\Consultation;
use App\Models\ConsultationDiagnosis;
use App\Models\ConsultationExternalExamination;
use App\Models\ConsultationFunctionalTest;
use App\Models\ConsultationFundoscopy;
use App\Models\ConsultationRefraction;
use App\Models\ConsultationVisualAcuity;
use App\Models\PatientAttachment;
use App\Models\Appointment;
use App\Models\Expense;
use App\Models\ExpensePayment;
use App\Models\InventoryItem;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ComprehensiveClinicalDataSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now()->toDateTimeString();

        // Departments
        Department::insertOrIgnore([
            ['name' => 'Outpatient Department', 'description' => 'Outpatient services', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Inpatient Department', 'description' => 'Inpatient services', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Emergency Department', 'description' => 'Emergency services', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Laboratory Department', 'description' => 'Laboratory services', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Radiology Department', 'description' => 'Radiology services', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Pharmacy Department', 'description' => 'Pharmacy services', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Expense Categories
        ExpenseCategory::insertOrIgnore([
            ['clinic_id' => 1, 'name' => 'Running Cost', 'description' => 'Daily operational expenses', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Improvement Cost', 'description' => 'Capital expenditures', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Staff Salaries', 'description' => 'Employee salaries', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Utilities', 'description' => 'Electricity, water, internet', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Medical Supplies', 'description' => 'Medical consumables', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Occupations
        Occupation::insertOrIgnore([
            ['name' => 'Teacher', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Farmer', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Business Owner', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Student', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Engineer', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Doctor', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Nurse', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Driver', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Accountant', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Police Officer', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Regions
        Region::insertOrIgnore([
            ['name' => 'Dar es Salaam', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Arusha', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Mwanza', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dodoma', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Tanga', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Districts
        District::insertOrIgnore([
            ['region_id' => 1, 'name' => 'Ilala', 'created_at' => $now, 'updated_at' => $now],
            ['region_id' => 1, 'name' => 'Kinondoni', 'created_at' => $now, 'updated_at' => $now],
            ['region_id' => 1, 'name' => 'Temeke', 'created_at' => $now, 'updated_at' => $now],
            ['region_id' => 1, 'name' => 'Ubungo', 'created_at' => $now, 'updated_at' => $now],
            ['region_id' => 1, 'name' => 'Kigamboni', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Information Sources
        InformationSource::insertOrIgnore([
            ['name' => 'Walk-in', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Referral', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Advertisement', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Friend/Family', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Online', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Insurance Companies
        InsuranceCompany::insertOrIgnore([
            ['clinic_id' => 1, 'name' => 'NHIF', 'code' => 'NHIF', 'contact_person' => 'John Doe', 'phone' => '0712345678', 'email' => 'nhif@example.com', 'address' => 'Dar es Salaam', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Jubilee Insurance', 'code' => 'JUB', 'contact_person' => 'Jane Smith', 'phone' => '0723456789', 'email' => 'jubilee@example.com', 'address' => 'Dar es Salaam', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'AAR Insurance', 'code' => 'AAR', 'contact_person' => 'Michael Johnson', 'phone' => '0734567890', 'email' => 'aar@example.com', 'address' => 'Dar es Salaam', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Operating Theatres
        OperatingTheatre::insertOrIgnore([
            ['clinic_id' => 1, 'name' => 'Main Theatre', 'location' => 'First Floor', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Minor Theatre', 'location' => 'Ground Floor', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Ambulance Vehicles
        AmbulanceVehicle::insertOrIgnore([
            ['clinic_id' => 1, 'registration_no' => 'T 123 ABC', 'vehicle_type' => 'Ambulance', 'model' => 'Toyota HiAce', 'capacity' => '4', 'driver_name' => 'John Doe', 'driver_phone' => '0712345678', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'registration_no' => 'T 456 DEF', 'vehicle_type' => 'Ambulance', 'model' => 'Mercedes Sprinter', 'capacity' => '6', 'driver_name' => 'Jane Smith', 'driver_phone' => '0723456789', 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Wards (separate from hospital_wards - these are geographical wards)
        Ward::insertOrIgnore([
            ['name' => 'Ilala Ward', 'district_id' => 1, 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Kinondoni Ward', 'district_id' => 2, 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Blood Donors
        BloodDonor::insertOrIgnore([
            ['clinic_id' => 1, 'donor_no' => 'DON001', 'first_name' => 'John', 'last_name' => 'Doe', 'blood_group' => 'A+', 'rh_factor' => 'Positive', 'phone' => '0712345678', 'email' => 'john@example.com', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'donor_no' => 'DON002', 'first_name' => 'Jane', 'last_name' => 'Smith', 'blood_group' => 'B+', 'rh_factor' => 'Positive', 'phone' => '0723456789', 'email' => 'jane@example.com', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'donor_no' => 'DON003', 'first_name' => 'Michael', 'last_name' => 'Brown', 'blood_group' => 'O+', 'rh_factor' => 'Positive', 'phone' => '0734567890', 'email' => 'michael@example.com', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Blood Bank Units
        BloodBankUnit::insertOrIgnore([
            ['clinic_id' => 1, 'unit_no' => 'UNIT001', 'blood_group' => 'A+', 'rh_factor' => 'Positive', 'donor_id' => 1, 'donation_date' => Carbon::now()->toDateString(), 'expiry_date' => Carbon::now()->addDays(35)->toDateString(), 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'unit_no' => 'UNIT002', 'blood_group' => 'B+', 'rh_factor' => 'Positive', 'donor_id' => 2, 'donation_date' => Carbon::now()->toDateString(), 'expiry_date' => Carbon::now()->addDays(35)->toDateString(), 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'unit_no' => 'UNIT003', 'blood_group' => 'O+', 'rh_factor' => 'Positive', 'donor_id' => 3, 'donation_date' => Carbon::now()->toDateString(), 'expiry_date' => Carbon::now()->addDays(35)->toDateString(), 'status' => 'Available', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Skip complex clinical data seeding for now - table structures vary
        // Appointments, Patient Check-ins, Vital Signs, Consultations, etc.
    }
}
