<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PopulateAllTablesSeeder extends Seeder
{
    private $now;

    private $maleNames = [
        'Juma', 'Baraka', 'Emmanuel', 'Peter', 'John', 'Daniel', 'Stephen', 'Joseph', 'Michael', 'David',
        'George', 'Frank', 'Alex', 'Samuel', 'Wilson', 'Ramadhan', 'Hassan', 'Said', 'Musa', 'Karim',
        'Abdul', 'Benson', 'Charles', 'Dominic', 'Elia', 'Fredrick', 'Godfrey', 'Hamisi', 'Ibrahim', 'Jonas',
    ];

    private $femaleNames = [
        'Neema', 'Asha', 'Zainabu', 'Maria', 'Grace', 'Sarah', 'Elizabeth', 'Anna', 'Mwanaisha', 'Rehema',
        'Halima', 'Amina', 'Salma', 'Joyce', 'Ester', 'Mary', 'Dorothy', 'Beatrice', 'Catherine', 'Janeth',
        'Lilian', 'Veronica', 'Flora', 'Diana', 'Eva', 'Frida', 'Gloria', 'Irene', 'Juliana', 'Khadija',
    ];

    private $lastNames = [
        'Mushi', 'Mwakyusa', 'Komba', 'Massawe', 'Mrema', 'Temba', 'Kimaro', 'Shirima', 'Swai', 'Lyimo',
        'Mollel', 'Kessy', 'Mahenge', 'Mbise', 'Ngowi', 'Mndeme', 'Maro', 'Mfaume', 'Mkumbo', 'Msaki',
        'Mwakalinga', 'Mwangombe', 'Mushi', 'Nnko', 'Omary', 'Pallangyo', 'Rugemalila', 'Sanga', 'Temu', 'Urio',
        'Warioba', 'Yusuf', 'Zengo', 'Chuwa', 'Lema', 'Msuya', 'Mmari', 'Shayo', 'Kileo', 'Mlay',
    ];

    private $phoneBase = [
        '0712345670', '0723456780', '0734567890', '0745678900', '0756789010', '0767890120', '0778901230', '0789012340',
    ];

    public function run()
    {
        $this->now = Carbon::now();

        $this->seedLookups();
        $this->seedUsers();
        $this->seedInventory();
        $this->seedPatientsAndChains();
        $this->seedClinical();
        $this->seedInpatient();
        $this->seedBloodAndAmbulance();
        $this->seedMortuaryAndTheatre();
        $this->seedMarketingAndOffice();
        $this->seedFinanceAndPerformance();

        $this->command->info('PopulateAllTablesSeeder complete.');
    }

    private function pick($arr)
    {
        return $arr[array_rand($arr)];
    }

    private function ts($offsetDays = 0)
    {
        return Carbon::now()->subDays($offsetDays)->subMinutes(rand(0, 1440))->toDateTimeString();
    }

    private function ts2($offsetDays = 0)
    {
        return Carbon::now()->subDays($offsetDays)->addMinutes(rand(0, 1440))->toDateTimeString();
    }

    private function countOf($table)
    {
        return DB::table($table)->count();
    }

    private function needed($table, $min)
    {
        return max(0, $min - $this->countOf($table));
    }

    private function insertRows($table, $rows)
    {
        if (empty($rows)) {
            return;
        }
        foreach (array_chunk($rows, 100) as $chunk) {
            DB::table($table)->insert($chunk);
        }
    }

    private function insertUnique($table, $rows)
    {
        if (empty($rows)) {
            return;
        }
        foreach ($rows as $row) {
            try {
                DB::table($table)->insert($row);
            } catch (\Exception $e) {
                // skip duplicate unique-key rows
            }
        }
    }

    private function ensureLookupNames($table, array $names, $makeRow, $min = 30)
    {
        $existing = DB::table($table)->pluck('name')->flip()->all();
        $need = $this->needed($table, $min);
        $rows = [];
        foreach ($names as $name) {
            if (count($rows) >= $need) {
                break;
            }
            if (isset($existing[$name])) {
                continue;
            }
            $existing[$name] = true;
            $rows[] = $makeRow($name);
        }
        $this->insertRows($table, $rows);
    }

    private function userIds($roles)
    {
        return DB::table('users')->whereIn('role', $roles)->pluck('id')->all();
    }

    private function seedLookups()
    {
        $now = $this->now->toDateTimeString();

        // Clinics (30 total)
        $clinicNames = [
            'SmartSoft Clinic', 'Kariakoo Medical Center', 'Mbezi Health Center', 'Bunju Clinic',
            'Sinza Health Center', 'Ubungo Medical Center', 'Kinondoni Clinic', 'Ilala Health Center',
            'Temeke Medical Center', 'Kigamboni Clinic', 'Tabata Health Center', 'Mwenge Clinic',
            'Kawe Medical Center', 'Mikocheni Health Center', 'Kimara Clinic', 'Tegeta Medical Center',
            'Masaki Clinic', 'Oysterbay Health Center', 'Msasani Medical Center', 'Upanga Clinic',
            'Kariakoo Hospital', 'Mnazi Mmoja Health Center', 'Gerezani Clinic', 'Kivukoni Medical Center',
            'Buguruni Health Center', 'Vingunguti Clinic', 'Kipawa Medical Center', 'Mchikichini Clinic',
            'Tandale Health Center', 'Manzese Medical Center',
        ];
        $rows = [];
        for ($i = $this->countOf('clinics'); $i < 30; $i++) {
            $rows[] = [
                'name' => $clinicNames[$i],
                'phone' => $this->pick($this->phoneBase),
                'email' => 'info' . ($i + 1) . '@polyclinic.co.tz',
                'address' => 'P.O. Box ' . (1000 + $i) . ' Dar es Salaam',
                'sms_balance' => rand(100, 5000),
                'sms_sender_name' => 'INFO',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertRows('clinics', $rows);

        // Regions (30 total)
        $regionNames = [
            'Dar es Salaam', 'Mwanza', 'Arusha', 'Mbeya', 'Morogoro', 'Tanga', 'Dodoma', 'Kilimanjaro',
            'Tabora', 'Iringa', 'Kigoma', 'Manyara', 'Rukwa', 'Lindi', 'Mtwara', 'Ruvuma', 'Shinyanga',
            'Singida', 'Pwani', 'Kagera', 'Mara', 'Simiyu', 'Geita', 'Songwe', 'Njombe', 'Katavi',
            'Zanzibar West', 'Zanzibar North', 'Pemba North', 'Pemba South',
        ];
        $this->ensureLookupNames('regions', $regionNames, function ($name) use ($now) {
            return [
                'name' => $name,
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        });

        // Districts (30 total)
        $districtNames = [
            'Kinondoni', 'Ilala', 'Temeke', 'Kigamboni', 'Ubungo', 'Ukonga', 'Mwanza City', 'Nyamagana',
            'Ilemela', 'Arusha City', 'Meru', 'Mbeya City', 'Ileje', 'Morogoro Municipality', 'Kilosa',
            'Tanga City', 'Muheza', 'Dodoma City', 'Chamwino', 'Moshi Municipal', 'Hai', 'Tabora Municipal',
            'Uyui', 'Iringa Municipal', 'Mufindi', 'Kigoma Ujiji', 'Kasulu', 'Babati', 'Mbulu',
            'Sumbawanga',
        ];
        $regionIds = DB::table('regions')->pluck('id')->all();
        $rows = [];
        for ($i = $this->countOf('districts'); $i < 30; $i++) {
            $rows[] = [
                'name' => $districtNames[$i],
                'region_id' => $regionIds[$i % count($regionIds)],
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('districts', $rows);

        // Wards (30 total)
        $wardNames = [
            'Kariakoo', 'Mchikichini', 'Gerezani', 'Kivukoni', 'Upanga', 'Mwananyamala', 'Mikocheni',
            'Msasani', 'Kawe', 'Mbezi', 'Bunju', 'Sinza', 'Kimara', 'Tabata', 'Buguruni', 'Vingunguti',
            'Kipawa', 'Tandale', 'Manzese', 'Magomeni', 'Kigogo', 'Ubungo', 'Ukonga', 'Segerea', 'Kinyerezi',
            'Chanika', 'Mbagala', 'Kuruti', 'Kibada', 'Vijibweni',
        ];
        $districtIds = DB::table('districts')->pluck('id')->all();
        $rows = [];
        for ($i = $this->countOf('wards'); $i < 30; $i++) {
            $rows[] = [
                'name' => $wardNames[$i],
                'district_id' => $districtIds[$i % count($districtIds)],
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('wards', $rows);

        // Item types (30 total)
        $itemTypeNames = [
            'Service', 'Pharmaceutical', 'Laboratory', 'Radiology', 'Others', 'Dental', 'Physiotherapy',
            'Optical', 'Surgical Supplies', 'IV Fluids', 'Injectables', 'Dressing Material', 'Orthopedic',
            'Diagnostic Kits', 'Disinfectants', 'Nutraceuticals', 'Medical Device', 'Vaccines',
            'Blood Products', 'Anesthesia Supplies', 'Laboratory Reagents', 'Imaging Supplies', 'Prosthetics',
            'Mobility Aids', 'Monitoring Equipment', 'Personal Protection', 'Stationery', 'Hygiene Products',
            'Nutrition', 'Counselling',
        ];
        $rows = [];
        for ($i = $this->countOf('item_types'); $i < 30; $i++) {
            $rows[] = [
                'name' => $itemTypeNames[$i],
                'description' => $itemTypeNames[$i] . ' related item',
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('item_types', $rows);

        // Consultation types (30 total)
        $consultationTypeNames = [
            'General Consultation', 'Follow-up', 'Emergency', 'Specialist', 'New Patient', 'Health Checkup',
            'Antenatal', 'Postnatal', 'Immunization', 'Dental Checkup', 'Physiotherapy', 'Dermatology',
            'Cardiology', 'Pediatrics', 'Surgery Consult', 'Eye Exam', 'ENT', 'Gynecological', 'Psychiatric',
            'Nutrition', 'Diabetes Clinic', 'Hypertension Clinic', 'HIV Care', 'TB Clinic', 'Family Planning',
            'Travel Medicine', 'Sports Medicine', 'Occupational Health', 'Geriatric', 'Palliative Care',
        ];
        $rows = [];
        for ($i = $this->countOf('consultation_types'); $i < 30; $i++) {
            $rows[] = [
                'name' => $consultationTypeNames[$i],
                'description' => $consultationTypeNames[$i],
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('consultation_types', $rows);

        // Units of measure (30 total)
        $unitNames = ['mg', 'Btl', 'PC', 'Tube', 'Kit', 'Box', 'Ltr', 'Cap', 'Tin', 'Amp', 'Tab', 'g',
            'kg', 'ml', 'cm', 'm', 'Piece', 'Pair', 'Set', 'Roll', 'Sachet', 'Vial', 'Syringe', 'Strip',
            'Pack', 'Dozen', 'Unit', 'Dose', 'Patch', 'Spray'];
        $rows = [];
        for ($i = $this->countOf('units_of_measure'); $i < 30; $i++) {
            $rows[] = [
                'name' => $unitNames[$i],
                'description' => $unitNames[$i],
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('units_of_measure', $rows);

        // Lens types (30 total)
        $lensNames = [
            'Single Vision', 'Bifocal', 'Progressive', 'Photochromic', 'Blue Light Filter', 'High Index',
            'Polarized', 'Aspheric', 'Spherical', 'Toric', 'Multifocal', 'Executive Bifocal',
            'Flat Top Bifocal', 'Round Segment', 'Prism Lens', 'Freeform', 'Varilux', 'Crizal',
            'Transitions', 'Zeiss', 'Hoya', 'Nikon', 'Rodenstock', 'Shamir', 'SOLA', 'Seiko', 'Kodak Lens',
            'Eyezen', 'Crizal Sapphire', 'UV400',
        ];
        $rows = [];
        for ($i = 0; $i < $this->needed('lens_types', 30); $i++) {
            $rows[] = [
                'name' => $lensNames[$i],
                'description' => $lensNames[$i],
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('lens_types', $rows);

        // Lab tests (30 total)
        $labTests = [
            ['Complete Blood Count', 'CBC', 'Hematology', 'Blood', 'cells/µL', '4.5-11.0', 15000, 2],
            ['Random Blood Sugar', 'RBS', 'Chemistry', 'Blood', 'mmol/L', '3.9-7.8', 8000, 1],
            ['Urinalysis', 'U/A', 'Chemistry', 'Urine', null, null, 12000, 3],
            ['Malaria Test', 'MAL', 'Parasitology', 'Blood', null, null, 10000, 1],
            ['Blood Group & Rh', 'BGR', 'Immunohematology', 'Blood', null, null, 10000, 1],
            ['HIV Rapid Test', 'HIV', 'Serology', 'Blood', null, null, 12000, 1],
            ['Liver Function Test', 'LFT', 'Chemistry', 'Blood', 'U/L', '5-40', 25000, 2],
            ['Renal Function Test', 'RFT', 'Chemistry', 'Blood', 'mmol/L', '60-120', 25000, 2],
            ['Lipid Profile', 'LIPID', 'Chemistry', 'Blood', 'mmol/L', '<5.2', 20000, 2],
            ['Thyroid Function', 'TSH', 'Endocrinology', 'Blood', 'mIU/L', '0.4-4.0', 30000, 3],
            ['HbA1c', 'HBA1C', 'Chemistry', 'Blood', '%', '4-6', 18000, 2],
            ['Widal Test', 'WIDAL', 'Serology', 'Blood', null, null, 9000, 1],
            ['Typhoid Test', 'TYPH', 'Serology', 'Blood', null, null, 10000, 1],
            ['Pregnancy Test', 'PT', 'Immunology', 'Urine', null, null, 8000, 1],
            ['Stool Examination', 'STOOL', 'Parasitology', 'Stool', null, null, 8000, 1],
            ['Sputum AFB', 'AFB', 'Microbiology', 'Sputum', null, null, 12000, 2],
            ['CD4 Count', 'CD4', 'Immunology', 'Blood', 'cells/µL', '>500', 35000, 3],
            ['Viral Load', 'VL', 'Molecular', 'Blood', 'copies/ml', '<40', 50000, 3],
            ['Electrolyte Panel', 'ELYTE', 'Chemistry', 'Blood', 'mmol/L', null, 15000, 2],
            ['Uric Acid', 'UA', 'Chemistry', 'Blood', 'mmol/L', '0.2-0.4', 10000, 1],
            ['Creatinine', 'CREAT', 'Chemistry', 'Blood', 'µmol/L', '50-110', 10000, 1],
            ['Bilirubin Panel', 'BILI', 'Chemistry', 'Blood', 'µmol/L', '<17', 12000, 1],
            ['Serum Iron', 'FE', 'Chemistry', 'Blood', 'µg/dL', '60-170', 12000, 1],
            ['Vitamin D', 'VITD', 'Chemistry', 'Blood', 'ng/mL', '30-100', 30000, 3],
            ['C-Reactive Protein', 'CRP', 'Serology', 'Blood', 'mg/L', '<10', 15000, 1],
            ['ESR', 'ESR', 'Hematology', 'Blood', 'mm/hr', '<20', 9000, 1],
            ['Platelet Count', 'PLT', 'Hematology', 'Blood', '10^9/L', '150-400', 10000, 1],
            ['Fasting Blood Sugar', 'FBS', 'Chemistry', 'Blood', 'mmol/L', '3.9-6.1', 8000, 1],
            ['Urine Culture', 'UC', 'Microbiology', 'Urine', null, null, 20000, 3],
            ['Blood Culture', 'BC', 'Microbiology', 'Blood', null, null, 30000, 4],
        ];
        $rows = [];
        $existing = $this->countOf('lab_tests');
        for ($i = $existing; $i < 30; $i++) {
            [$name, $code, $cat, $spec, $unit, $range, $price, $tat] = $labTests[$i];
            $rows[] = [
                'clinic_id' => 1,
                'name' => $name,
                'code' => $code,
                'category' => $cat,
                'specimen_type' => $spec,
                'preparation' => null,
                'unit' => $unit,
                'reference_range' => $range,
                'price' => $price,
                'turnaround_time' => $tat,
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertRows('lab_tests', $rows);

        // Radiology exams (30 total)
        $radiologyExams = [
            ['Chest X-Ray', 'CXR', 'X-Ray', 25000, 1],
            ['Abdominal Ultrasound', 'AUS', 'Ultrasound', 35000, 1],
            ['CT Scan of Head', 'CTH', 'CT Scan', 120000, 2],
            ['Pelvic Ultrasound', 'PUS', 'Ultrasound', 30000, 1],
            ['Limb X-Ray', 'LXR', 'X-Ray', 20000, 1],
            ['Chest X-Ray PA', 'CXRP', 'X-Ray', 25000, 1],
            ['X-Ray Skull', 'XRS', 'X-Ray', 22000, 1],
            ['X-Ray Spine', 'XSP', 'X-Ray', 25000, 1],
            ['X-Ray Pelvis', 'XPL', 'X-Ray', 22000, 1],
            ['X-Ray Shoulder', 'XSH', 'X-Ray', 20000, 1],
            ['X-Ray Knee', 'XKN', 'X-Ray', 20000, 1],
            ['X-Ray Ankle', 'XAN', 'X-Ray', 18000, 1],
            ['CT Abdomen', 'CTA', 'CT Scan', 180000, 3],
            ['CT Chest', 'CTC', 'CT Scan', 180000, 3],
            ['MRI Brain', 'MRIB', 'MRI', 300000, 4],
            ['MRI Spine', 'MRIS', 'MRI', 300000, 4],
            ['MRI Knee', 'MRIK', 'MRI', 250000, 4],
            ['Ultrasound Breast', 'USB', 'Ultrasound', 40000, 1],
            ['Ultrasound Thyroid', 'UST', 'Ultrasound', 40000, 1],
            ['Mammogram', 'MAM', 'Mammography', 80000, 2],
            ['Echocardiogram', 'ECHO', 'Cardiac Imaging', 100000, 2],
            ['ECG', 'ECG', 'Cardiac Imaging', 20000, 1],
            ['X-Ray Abdomen', 'XAB', 'X-Ray', 22000, 1],
            ['X-Ray Foot', 'XFT', 'X-Ray', 18000, 1],
            ['X-Ray Hand', 'XHD', 'X-Ray', 18000, 1],
            ['CT Spine', 'CTS', 'CT Scan', 150000, 3],
            ['MRI Abdomen', 'MRIA', 'MRI', 350000, 4],
            ['Ultrasound Renal', 'USR', 'Ultrasound', 35000, 1],
            ['Dental X-Ray', 'DXR', 'X-Ray', 15000, 1],
            ['Barium Meal', 'BM', 'Fluoroscopy', 60000, 2],
        ];
        $rows = [];
        $existing = $this->countOf('radiology_exams');
        for ($i = $existing; $i < 30; $i++) {
            [$name, $code, $cat, $price, $tat] = $radiologyExams[$i];
            $rows[] = [
                'clinic_id' => 1,
                'name' => $name,
                'code' => $code,
                'category' => $cat,
                'preparation' => null,
                'description' => null,
                'price' => $price,
                'turnaround_time' => $tat,
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertRows('radiology_exams', $rows);

        // Insurance companies (30 total)
        $insuranceNames = [
            'NHIF', 'AAR Healthcare', 'Jubilee Health', 'Sanlam', 'Resolution Health', 'Heritage Insurance',
            'Strategis Insurance', 'Fountain Healthcare', 'Britam Insurance', 'GA Insurance', 'UAP Insurance',
            'African Alliance', 'Metropolitan Insurance', 'SITMA', 'WCF', 'PPF', 'NSSF', 'SIDO', 'Tiba Kwa Maisha',
            'M-Tiba', 'SBC', 'Water and Sewerage CO', 'DITF', 'CHEST', 'Dar es Salaam Water', 'Tanesco Health',
            'NHC Staff', 'Bank of Tanzania', 'CRDB Staff', 'NMB Staff',
        ];
        $rows = [];
        $existing = $this->countOf('insurance_companies');
        for ($i = $existing; $i < 30; $i++) {
            $rows[] = [
                'clinic_id' => 1,
                'name' => $insuranceNames[$i],
                'code' => 'INS' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                'type' => rand(0, 1) ? 'Government' : 'Private',
                'contact_person' => $this->pick($this->maleNames) . ' ' . $this->pick($this->lastNames),
                'phone' => $this->pick($this->phoneBase),
                'email' => 'claims' . ($i + 1) . '@insurer.co.tz',
                'address' => 'P.O. Box ' . (5000 + $i) . ', Dar es Salaam',
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertRows('insurance_companies', $rows);

        // Departments (30 total)
        $departmentNames = [
            'Administration', 'Outpatient Department', 'Inpatient Department', 'Pharmacy', 'Laboratory',
            'Radiology', 'Triage', 'Emergency', 'Operating Theatre', 'Maternity', 'Pediatrics', 'Dental',
            'Physiotherapy', 'Optometry', 'Nutrition', 'Medical Records', 'Nursing', 'Finance', 'Human Resources',
            'IT', 'Maintenance', 'Security', 'Ambulance Services', 'Mortuary', 'Blood Bank', 'Marketing',
            'Customer Care', 'Counselling', 'Pharmacy Admin', 'Consultation Room',
        ];
        $this->ensureLookupNames('departments', $departmentNames, function ($name) use ($now) {
            return [
                'clinic_id' => 1,
                'name' => $name,
                'description' => $name . ' department',
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        });

        // Hospital wards (30 total)
        $wardDefs = [
            ['General Ward', 'GW', 'General'], ['Maternity Ward', 'MW', 'Maternity'], ['Pediatric Ward', 'PW', 'Pediatric'],
            ['Private Ward', 'PVW', 'Private'], ['Surgical Ward 1', 'SW1', 'Surgical'], ['Surgical Ward 2', 'SW2', 'Surgical'],
            ['ICU Ward', 'ICU', 'Isolation'], ['Isolation Ward', 'IW', 'Isolation'], ['Cardiology Ward', 'CW', 'General'],
            ['Neurology Ward', 'NW', 'General'], ['Orthopedic Ward', 'OW', 'Surgical'], ['ENT Ward', 'EW', 'General'],
            ['Oncology Ward', 'ONW', 'General'], ['Renal Ward', 'RW', 'General'], ['Dermatology Ward', 'DW', 'General'],
            ['Psychiatric Ward', 'PSW', 'General'], ['TB Ward', 'TBW', 'Isolation'], ['COVID Ward', 'CVW', 'Isolation'],
            ['Recovery Ward', 'RCW', 'General'], ['High Dependency Ward', 'HDW', 'Isolation'], ['Dental Ward', 'DNW', 'General'],
            ['Eye Ward', 'EYW', 'General'], ['Burn Ward', 'BRW', 'Surgical'], ['Palliative Ward', 'PAW', 'General'],
            ['Maternity Ward 2', 'MW2', 'Maternity'], ['Pediatric Ward 2', 'PW2', 'Pediatric'], ['Step-Down Ward', 'SDW', 'General'],
            ['Female Medical Ward', 'FMW', 'General'], ['Male Medical Ward', 'MMW', 'General'], ['Private Suite Ward', 'PSU', 'Private'],
        ];
        $rows = [];
        $existing = $this->countOf('hospital_wards');
        for ($i = $existing; $i < 30; $i++) {
            [$name, $code, $type] = $wardDefs[$i];
            $rows[] = [
                'clinic_id' => 1,
                'name' => $name,
                'code' => $code,
                'ward_type' => $type,
                'floor' => rand(0, 4) . ' Floor',
                'bed_capacity' => rand(4, 20),
                'price_per_day' => rand(10000, 80000),
                'description' => $name . ' for inpatient care',
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('hospital_wards', $rows);

        // Job titles (30 total)
        $jobTitleNames = [
            'Receptionist', 'Doctor', 'Cashier', 'Surgeon', 'Pediatrician', 'Gynecologist', 'Anesthesiologist',
            'Radiologist', 'Lab Technician', 'Pharmacist', 'Physiotherapist', 'Dentist', 'Optometrist',
            'Nurse Practitioner', 'Midwife', 'Medical Officer', 'Intern', 'Pharmacist Assistant', 'Radiographer',
            'Mortuary Attendant', 'Ambulance Driver', 'Medical Records Clerk', 'Administrator', 'Accountant',
            'Secretary', 'Reception Supervisor', 'IT Officer', 'Nutritionist', 'Psychologist', 'Pathologist',
        ];
        $rows = [];
        for ($i = $this->countOf('job_titles'); $i < 30; $i++) {
            $rows[] = [
                'clinic_id' => 1,
                'name' => $jobTitleNames[$i],
                'description' => $jobTitleNames[$i],
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('job_titles', $rows);

        // Payment modes (30 total)
        $paymentModeNames = [
            'Cash', 'M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Halopesa', 'Insurance', 'Bank Transfer', 'Card',
            'Cheque', 'Credit', 'Voucher', 'Employer', 'NHIF', 'WHT', 'Medical Scheme', 'Mobile Money',
            'Paybill', 'RTGS', 'Standing Order', 'Direct Debit', 'e-Wallet', 'Cashback', 'Bonus', 'Gift Voucher',
            'School Fee', 'Corporate Account', 'Staff Scheme', 'Community Fund', 'Debt Settlement', 'Other',
        ];
        $rows = [];
        $existing = $this->countOf('payment_modes');
        for ($i = $existing; $i < 30; $i++) {
            $rows[] = [
                'clinic_id' => 1,
                'name' => $paymentModeNames[$i],
                'description' => $paymentModeNames[$i] . ' payment mode',
                'transaction_type' => $i <= 4 ? 'Cash' : 'Credit',
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('payment_modes', $rows);

        // Payment channels (30 total)
        $channelNames = [
            'Cash', 'Credit', 'Bank Transfer', 'M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Halopesa', 'Card Terminal',
            'Online Payment', 'Cheque', 'NHIF Portal', 'Insurance Portal', 'Mobile Money', 'Paybill', 'USSD',
            'QR Code', 'ATM Card', 'Visa', 'Mastercard', 'PayPal', 'Direct Deposit', 'Standing Order', 'Agent',
            'Cashier Counter', 'Employer Deduction', 'Health Fund', 'Voucher Code', 'Wallet Transfer', 'Point Sale',
            'Bank Deposit',
        ];
        $rows = [];
        $existing = $this->countOf('payment_channels');
        for ($i = $existing; $i < 30; $i++) {
            $rows[] = [
                'clinic_id' => 1,
                'name' => $channelNames[$i],
                'description' => $channelNames[$i] . ' channel',
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('payment_channels', $rows);

        // Information sources (30 total)
        $infoSourceNames = [
            'Radio', 'Television', 'Newspaper', 'Social Media', 'Word of Mouth', 'Friend', 'Family', 'Referral',
            'Walk-in', 'Billboard', 'Flyer', 'Internet', 'WhatsApp', 'Facebook', 'Instagram', 'TikTok', 'YouTube',
            'Poster', 'Community Health Worker', 'Employer', 'School', 'Religious Group', 'Outreach Event',
            'Pharmacy', 'Previous Visit', 'SMS Campaign', 'Email Campaign', 'Call Center', 'Bus Stop Ad',
            'Health Talk',
        ];
        $this->ensureLookupNames('information_sources', $infoSourceNames, function ($name) use ($now) {
            return [
                'clinic_id' => 1,
                'name' => $name,
                'description' => $name,
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        });

        // Expense categories (30 total)
        $expenseCategoryNames = [
            'Utilities', 'Rent', 'Salaries', 'Equipment', 'Supplies', 'Maintenance', 'Transport', 'Marketing',
            'Insurance', 'Taxes', 'Medical Supplies', 'Office Supplies', 'Fuel', 'Staff Training',
            'Software Licenses', 'Cleaning Services', 'Security Services', 'Telephone/Internet', 'Printing',
            'Legal Fees', 'Bank Charges', 'Vehicle Maintenance', 'Building Renovation', 'Medical Waste Disposal',
            'Staff Welfare', 'Pharmaceutical Purchases', 'Laboratory Reagents', 'Blood Bank Supplies', 'Ambulance Fuel',
            'Mortuary Operations',
        ];
        $this->ensureLookupNames('expense_categories', $expenseCategoryNames, function ($name) use ($now) {
            return [
                'clinic_id' => 1,
                'name' => $name,
                'description' => $name,
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        });

        // Email alert settings (one per clinic -> 30)
        $rows = [];
        $clinicIds = DB::table('clinics')->pluck('id')->all();
        foreach ($clinicIds as $cid) {
            $rows[] = [
                'clinic_id' => $cid,
                'email_alerts_enabled' => rand(0, 1),
                'smtp_host' => 'smtp.gmail.com',
                'smtp_port' => '587',
                'smtp_username' => 'alerts@polyclinic.co.tz',
                'smtp_password' => 'secret',
                'smtp_encryption' => 'tls',
                'from_email' => 'alerts@polyclinic.co.tz',
                'from_name' => 'Polyclinic HMS',
                'appointment_notifications' => 1,
                'patient_registration_notifications' => 1,
                'consultation_reminders' => 1,
                'prescription_ready_notifications' => 1,
                'bill_reminders' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('email_alert_settings', $rows);

        // Preferences (fill to 30)
        $rows = [];
        $existingPrefs = $this->countOf('preferences');
        $prefKeys = ['DAILY_ACTIVITY_REMINDER', 'BILLING_PREFIX', 'APPOINTMENT_WINDOW', 'LAB_PRINT_COPIES',
            'RAD_PRINT_COPIES', 'RECEIPT_FOOTER', 'CLINIC_MOTTO', 'SUPPORT_PHONE', 'SUPPORT_EMAIL',
            'DEFAULT_CURRENCY', 'TAX_RATE', 'PATIENT_ID_PREFIX'];
        for ($i = $existingPrefs; $i < 30; $i++) {
            $rows[] = [
                'clinic_id' => 1,
                'key' => $prefKeys[$i - 18] ?? ('PREF_' . ($i + 1)),
                'value' => $this->pick(['Yes', 'No', 'INFO', '12000', 'TZS', 'Polyclinic HMS']),
            ];
        }
        $this->insertRows('preferences', $rows);
    }

    private function seedUsers()
    {
        $now = $this->now->toDateTimeString();
        $adminId = DB::table('users')->where('role', 'Admin')->value('id') ?: 1;
        $departmentIds = DB::table('departments')->pluck('id')->all();
        $jobTitleIds = DB::table('job_titles')->pluck('id')->all();

        $userDefs = [
            ['Doctor', 'Doctor', 'General Physician'],
            ['Doctor', 'Doctor', 'Surgeon'],
            ['Doctor', 'Doctor', 'Pediatrician'],
            ['Doctor', 'Doctor', 'Gynecologist'],
            ['Doctor', 'Doctor', 'Anesthesiologist'],
            ['Doctor', 'Doctor', 'Radiologist'],
            ['Doctor', 'Doctor', 'Dentist'],
            ['Doctor', 'Doctor', 'Optometrist'],
            ['Nurse', 'Other', 'Triage'],
            ['Nurse', 'Other', 'Ward Nurse'],
            ['Nurse', 'Other', 'ICU Nurse'],
            ['Nurse', 'Other', 'Maternity Nurse'],
            ['Nurse', 'Other', 'Theatre Nurse'],
            ['Receptionist', 'Other', 'Front Desk'],
            ['Receptionist', 'Other', 'Reception Supervisor'],
            ['Cashier', 'Other', 'Payment Center'],
            ['Cashier', 'Other', 'Senior Cashier'],
            ['Laboratory Technician', 'Other', 'Lab Supervisor'],
            ['Laboratory Technician', 'Other', 'Lab Assistant'],
            ['Radiologist', 'Other', 'Imaging'],
            ['Pharmacist', 'Other', 'Pharmacy'],
            ['Pharmacist', 'Other', 'Pharmacy Assistant'],
            ['Accountant', 'Other', 'Finance'],
            ['Admin', 'Other', 'Administration'],
            ['Admin', 'Other', 'Operations'],
            ['Physiotherapist', 'Other', 'Rehabilitation'],
        ];
        $rows = [];
        $count = $this->countOf('users');
        $needed = $this->needed('users', 30);
        for ($i = 0; $i < $needed; $i++) {
            [$role, $designation, $jobTitle] = $userDefs[$i % count($userDefs)];
            $gender = rand(0, 1) ? 'Male' : 'Female';
            $first = $gender === 'Male' ? $this->pick($this->maleNames) : $this->pick($this->femaleNames);
            $last = $this->pick($this->lastNames);
            $rows[] = [
                'clinic_id' => 1,
                'first_name' => $first,
                'middle_name' => null,
                'last_name' => $last,
                'username' => strtolower($first) . ($count + $i + 1),
                'password' => Hash::make('1234'),
                'role' => $role,
                'designation' => $designation,
                'department_id' => $this->pick($departmentIds),
                'job_title_id' => $this->pick($jobTitleIds),
                'employee_number' => 'EMP' . str_pad($count + $i + 1, 4, '0', STR_PAD_LEFT),
                'date_of_birth' => Carbon::now()->subYears(rand(24, 58))->toDateString(),
                'gender' => $gender,
                'national_id' => (string) rand(19800000000000, 19999999999999),
                'phone' => $this->pick($this->phoneBase),
                'email' => strtolower($first) . '.' . strtolower($last) . ($count + $i + 1) . '@polyclinic.co.tz',
                'status' => 'Active',
                'created_by' => $adminId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('users', $rows);
    }

    private function seedInventory()
    {
        $now = $this->now->toDateTimeString();
        $unitIds = DB::table('units_of_measure')->pluck('id')->all();
        $itemTypeIds = DB::table('item_types')->pluck('id')->all();
        $consultationTypeIds = DB::table('consultation_types')->pluck('id')->all();
        $lensTypeIds = DB::table('lens_types')->pluck('id')->all();
        $paymentModeIds = DB::table('payment_modes')->pluck('id')->all();

        // Items (30 total)
        $itemDefs = [
            ['Paracetamol 500mg', 'PARA500', 2, 1, 3],
            ['Amoxicillin 250mg Capsules', 'AMOX250', 2, 1, 8],
            ['ORS Sachets', 'ORS', 2, 1, 3],
            ['Ciprofloxacin 500mg', 'CIPRO500', 2, 1, 3],
            ['Metronidazole 400mg', 'MET400', 2, 1, 3],
            ['Complete Blood Count', 'CBCSVC', 3, 1, 3],
            ['Random Blood Sugar', 'RBSSVC', 3, 1, 3],
            ['Urinalysis', 'UASVC', 3, 1, 3],
            ['Chest X-Ray', 'CXRSVC', 4, 1, 3],
            ['Consultation Fee', 'CONSFEE', 1, 1, 3],
            ['Single Vision Lens', 'SVL', 5, 1, 3],
            ['Progressive Lens', 'PROG', 5, 1, 3],
            ['Glucose IV 5% 500ml', 'GLU5', 2, 1, 4],
            ['Normal Saline 500ml', 'NS500', 2, 1, 4],
            ['Ibuprofen 400mg', 'IBU400', 2, 1, 3],
            ['Diclofenac Gel', 'DICLOGEL', 2, 1, 2],
            ['Cetirizine 10mg', 'CET10', 2, 1, 3],
            ['Prednisolone 5mg', 'PRED5', 2, 1, 3],
            ['Salbutamol Inhaler', 'SALB', 2, 1, 10],
            ['Amlodipine 5mg', 'AML5', 2, 1, 3],
            ['Metformin 500mg', 'MET5', 2, 1, 3],
            ['Insulin Glargine', 'INSG', 2, 1, 14],
            ['Gauze Roll', 'GAUZE', 6, 1, 15],
            ['Surgical Gloves (Box)', 'GLOVES', 6, 1, 16],
            ['Syringe 5ml', 'SYR5', 6, 1, 17],
            ['Alcohol Swabs', 'SWABS', 6, 1, 16],
            ['Thermometer', 'THERMO', 7, 1, 3],
            ['Blood Pressure Machine', 'BPM', 7, 1, 3],
            ['Stethoscope', 'STETHO', 7, 1, 3],
            ['Eye Examination Kit', 'EYEKIT', 7, 1, 5],
        ];
        $rows = [];
        $existing = $this->countOf('items');
        for ($i = $existing; $i < 30; $i++) {
            [$name, $code, $typeIdx, $consultIdx, $unitIdx] = $itemDefs[$i];
            $lens = ($i === 10 || $i === 11) ? $lensTypeIds[array_rand($lensTypeIds)] : null;
            $rows[] = [
                'clinic_id' => 1,
                'name' => $name,
                'code' => $code,
                'category' => null,
                'item_type_id' => $itemTypeIds[$typeIdx % count($itemTypeIds)],
                'consultation_type_id' => $consultationTypeIds[$consultIdx % count($consultationTypeIds)],
                'unit_of_measure_id' => $unitIds[$unitIdx % count($unitIds)],
                'lens_type_id' => $lens,
                'is_consultation_item' => $i === 9 ? 'Yes' : 'No',
                'is_stock_item' => rand(0, 1) ? 'Yes' : 'No',
                'balance' => rand(50, 800),
                'new_balance' => rand(50, 800),
                'unit_buying_price' => rand(500, 30000),
                'expiry_date' => Carbon::now()->addMonths(rand(3, 24))->toDateString(),
                'minimum_stock' => rand(10, 100),
                'has_expiry' => rand(0, 1) ? 'Yes' : 'No',
                'templates' => null,
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('items', $rows);

        // Medicines (30 total)
        $medicineDefs = [
            ['Paracetamol 500mg', 'MED-PARA', 'Paracetamol', 'Panadol', 50, 100],
            ['Amoxicillin 250mg', 'MED-AMOX', 'Amoxicillin', 'Amoxil', 80, 150],
            ['ORS', 'MED-ORS', 'Oral Rehydration Salts', 'GESO', 30, 80],
            ['Ciprofloxacin 500mg', 'MED-CIPRO', 'Ciprofloxacin', 'Ciproxin', 120, 200],
            ['Metronidazole 400mg', 'MED-METRO', 'Metronidazole', 'Flagyl', 60, 120],
            ['Ibuprofen 400mg', 'MED-IBU', 'Ibuprofen', 'Brufen', 70, 130],
            ['Diclofenac 50mg', 'MED-DICLO', 'Diclofenac', 'Voltaren', 90, 160],
            ['Cetirizine 10mg', 'MED-CET', 'Cetirizine', 'Zyrtec', 40, 90],
            ['Prednisolone 5mg', 'MED-PRED', 'Prednisolone', 'Predone', 80, 140],
            ['Salbutamol 100mcg', 'MED-SALB', 'Salbutamol', 'Ventolin', 500, 800],
            ['Amlodipine 5mg', 'MED-AML', 'Amlodipine', 'Norvasc', 100, 180],
            ['Metformin 500mg', 'MED-METF', 'Metformin', 'Glucophage', 90, 160],
            ['Insulin Glargine 100iu', 'MED-INSU', 'Insulin Glargine', 'Lantus', 15000, 18000],
            ['Diazepam 5mg', 'MED-DIAZ', 'Diazepam', 'Valium', 80, 150],
            ['Omeprazole 20mg', 'MED-OME', 'Omeprazole', 'Losec', 60, 120],
            ['Hydrochlorothiazide 25mg', 'MED-HCT', 'Hydrochlorothiazide', 'Hydrodiuril', 50, 100],
            ['Losartan 50mg', 'MED-LOS', 'Losartan', 'Cozaar', 120, 200],
            ['Atorvastatin 20mg', 'MED-ATO', 'Atorvastatin', 'Lipitor', 150, 240],
            ['Vitamin B Complex', 'MED-VITB', 'Vitamin B Complex', 'Becozym', 40, 90],
            ['Ferrous Sulphate 200mg', 'MED-FE', 'Ferrous Sulphate', 'Fefol', 30, 70],
            ['Folic Acid 5mg', 'MED-FOL', 'Folic Acid', 'Folvite', 25, 60],
            ['Zinc Sulfate 20mg', 'MED-ZN', 'Zinc Sulfate', 'Zinca', 20, 50],
            ['Artemether/Lumefantrine', 'MED-ACT', 'Artemether Lumefantrine', 'Coartem', 400, 700],
            ['Quinine 300mg', 'MED-QN', 'Quinine', 'Quinimax', 250, 400],
            ['Albendazole 400mg', 'MED-ALB', 'Albendazole', 'Zentel', 40, 80],
            ['Mebendazole 100mg', 'MED-MEB', 'Mebendazole', 'Vermox', 30, 60],
            ['Erythromycin 250mg', 'MED-ERY', 'Erythromycin', 'Erythrocin', 150, 250],
            ['Cloxacillin 500mg', 'MED-CLOX', 'Cloxacillin', 'Cloxapen', 130, 220],
            ['Gentamicin Eye Drops', 'MED-GENT', 'Gentamicin', 'Garamycin', 200, 350],
            ['Chloramphenicol Eye Drops', 'MED-CHLOR', 'Chloramphenicol', 'Chloroptic', 150, 280],
        ];
        $rows = [];
        for ($i = 0; $i < $this->needed('medicines', 30); $i++) {
            [$name, $code, $generic, $brand, $buy, $sell] = $medicineDefs[$i];
            $rows[] = [
                'clinic_id' => 1,
                'name' => $name,
                'code' => $code,
                'generic_name' => $generic,
                'brand_name' => $brand,
                'description' => $name,
                'unit_of_measure_id' => $unitIds[array_rand($unitIds)],
                'balance' => rand(100, 2000),
                'new_balance' => rand(100, 2000),
                'unit_buying_price' => $buy,
                'selling_price' => $sell,
                'expiry_date' => Carbon::now()->addMonths(rand(3, 24))->toDateString(),
                'minimum_stock' => rand(20, 100),
                'has_expiry' => 'Yes',
                'prescription_required' => rand(0, 1) ? 'Yes' : 'No',
                'controlled_substance' => rand(0, 4) === 0 ? 'Yes' : 'No',
                'dosage_instructions' => 'As prescribed by the doctor.',
                'side_effects' => 'Nausea, headache, dizziness.',
                'contraindications' => 'Hypersensitivity to active ingredient.',
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('medicines', $rows);

        // Inventory items (30 total)
        $rows = [];
        for ($i = 0; $i < $this->needed('inventory_items', 30); $i++) {
            $rows[] = [
                'clinic_id' => 1,
                'name' => $itemDefs[$i % count($itemDefs)][0] . ' (Inv)',
                'code' => 'INV-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'description' => 'Inventory stock item',
                'item_type_id' => $itemTypeIds[array_rand($itemTypeIds)],
                'unit_of_measure_id' => $unitIds[array_rand($unitIds)],
                'balance' => rand(100, 3000),
                'new_balance' => rand(100, 3000),
                'unit_buying_price' => rand(200, 20000),
                'selling_price' => rand(300, 25000),
                'expiry_date' => Carbon::now()->addMonths(rand(2, 24))->toDateString(),
                'minimum_stock' => rand(10, 200),
                'has_expiry' => rand(0, 1) ? 'Yes' : 'No',
                'supplier' => 'Medical Supplies Ltd',
                'location' => 'Store Room ' . rand(1, 5),
                'notes' => null,
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('inventory_items', $rows);

        // Item prices (30 total)
        $rows = [];
        $itemIds = DB::table('items')->pluck('id')->all();
        $existing = $this->countOf('item_prices');
        for ($i = 0; $i < $this->needed('item_prices', 30); $i++) {
            $rows[] = [
                'item_id' => $itemIds[($existing + $i) % count($itemIds)],
                'payment_mode_id' => $paymentModeIds[array_rand($paymentModeIds)],
                'unit_price' => rand(500, 200000),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertRows('item_prices', $rows);
    }

    private function seedPatientsAndChains()
    {
        $now = $this->now->toDateTimeString();
        $regionIds = DB::table('regions')->pluck('id')->all();
        $districtIds = DB::table('districts')->pluck('id')->all();
        $wardIds = DB::table('wards')->pluck('id')->all();
        $paymentModeIds = DB::table('payment_modes')->pluck('id')->all();
        $infoSourceIds = DB::table('information_sources')->pluck('id')->all();
        $clinicIds = DB::table('clinics')->pluck('id')->all();
        $userIds = DB::table('users')->pluck('id')->all();
        $adminId = DB::table('users')->where('role', 'Admin')->value('id') ?: 1;
        $insuranceIds = DB::table('insurance_companies')->pluck('id')->all();
        $itemIds = DB::table('items')->pluck('id')->all();
        $consultationTypeIds = DB::table('consultation_types')->pluck('id')->all();

        // Patients (30 total)
        $rows = [];
        $existing = $this->countOf('patients');
        for ($i = 0; $i < $this->needed('patients', 30); $i++) {
            $gender = rand(0, 1) ? 'Male' : 'Female';
            $first = $gender === 'Male' ? $this->pick($this->maleNames) : $this->pick($this->femaleNames);
            $last = $this->pick($this->lastNames);
            $rows[] = [
                'clinic_id' => $clinicIds[array_rand($clinicIds)],
                'first_name' => $first,
                'middle_name' => null,
                'last_name' => $last,
                'gender' => $gender,
                'date_of_birth' => Carbon::now()->subYears(rand(1, 85))->toDateString(),
                'region_id' => $regionIds[array_rand($regionIds)],
                'district_id' => $districtIds[array_rand($districtIds)],
                'ward_id' => $wardIds[array_rand($wardIds)],
                'address' => 'Street ' . rand(1, 200) . ', Dar es Salaam',
                'national_id' => (string) rand(19800000000000, 19999999999999),
                'phone' => $this->pick($this->phoneBase),
                'email' => null,
                'occupation' => DB::table('occupations')->inRandomOrder()->value('name'),
                'payment_mode_id' => $paymentModeIds[array_rand($paymentModeIds)],
                'info_source_id' => $infoSourceIds[array_rand($infoSourceIds)],
                'is_vip' => rand(0, 9) === 0 ? 1 : 0,
                'is_student' => rand(0, 9) === 0 ? 1 : 0,
                'is_businessperson' => rand(0, 9) === 0 ? 1 : 0,
                'is_outreach' => rand(0, 9) === 0 ? 1 : 0,
                'is_employee' => rand(0, 9) === 0 ? 1 : 0,
                'created_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('patients', $rows);

        // Patient insurances (30 total)
        $patientIds = DB::table('patients')->pluck('id')->all();
        $rows = [];
        for ($i = 0; $i < $this->needed('patient_insurances', 30); $i++) {
            $rows[] = [
                'patient_id' => $patientIds[array_rand($patientIds)],
                'insurance_company_id' => $insuranceIds[array_rand($insuranceIds)],
                'member_number' => 'MBR' . str_pad($i + 1, 8, '0', STR_PAD_LEFT),
                'card_number' => 'CRD' . str_pad($i + 1, 8, '0', STR_PAD_LEFT),
                'valid_from' => Carbon::now()->subMonths(rand(1, 12))->toDateString(),
                'valid_until' => Carbon::now()->addMonths(rand(3, 24))->toDateString(),
                'status' => 'Active',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertRows('patient_insurances', $rows);

        // Payment chains (check-ins + payment cache + items) to support consultations and reports
        $createdCheckIns = $this->countOf('patient_check_ins');
        $checkInRows = [];
        for ($i = 0; $i < 30; $i++) {
            $checkInRows[] = [
                'patient_id' => $patientIds[array_rand($patientIds)],
                'payment_mode_id' => $paymentModeIds[array_rand($paymentModeIds)],
                'mode' => 'checkin',
                'created_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('patient_check_ins', $checkInRows);

        $newCheckInIds = DB::table('patient_check_ins')->orderByDesc('id')->limit(30)->pluck('id')->all();
        $cacheRows = [];
        foreach ($newCheckInIds as $cid) {
            $cacheRows[] = [
                'check_in_id' => $cid,
                'consultation_id' => null,
                'created_by' => $adminId,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('patient_payment_cache', $cacheRows);

        $newCacheIds = DB::table('patient_payment_cache')->orderByDesc('id')->limit(30)->pluck('id')->all();
        $cacheItemRows = [];
        foreach ($newCacheIds as $cid) {
            $cacheItemRows[] = [
                'payment_cache_id' => $cid,
                'item_id' => $itemIds[array_rand($itemIds)],
                'medicine_id' => null,
                'prescription_id' => null,
                'prescription_item_id' => null,
                'consultation_type_id' => $consultationTypeIds[array_rand($consultationTypeIds)],
                'consultant_id' => $userIds[array_rand($userIds)],
                'payment_mode_id' => $paymentModeIds[array_rand($paymentModeIds)],
                'unit_price' => rand(500, 50000),
                'quantity' => rand(1, 5),
                'item_payment_id' => null,
                'bill_id' => null,
                'created_by' => $adminId,
                'dosage' => null,
                'comments' => null,
                'status' => 'Pending',
                'served_at' => null,
                'served_by' => null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('patient_payment_cache_items', $cacheItemRows);

        // Patient calling statuses (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('patient_calling_statuses', 30); $i++) {
            $rows[] = [
                'patient_id' => $patientIds[array_rand($patientIds)],
                'status' => $this->pick(['need_to_call', 'called', 'unreachable']),
                'notes' => 'Follow-up call for the patient.',
                'called_by' => $userIds[array_rand($userIds)],
                'called_at' => $this->ts(rand(1, 30)),
                'created_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('patient_calling_statuses', $rows);

        // Patient waiting times (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('patient_waiting_times', 30); $i++) {
            $reg = $this->ts(rand(0, 30));
            $start = Carbon::parse($reg)->addMinutes(rand(5, 120))->toDateTimeString();
            $end = Carbon::parse($start)->addMinutes(rand(10, 90))->toDateTimeString();
            $rows[] = [
                'patient_id' => $patientIds[array_rand($patientIds)],
                'registration_time' => $reg,
                'treatment_start_time' => $start,
                'treatment_end_time' => $end,
                'waiting_duration_minutes' => rand(5, 120),
                'treatment_duration_minutes' => rand(10, 90),
                'status' => 'completed',
                'doctor_id' => $userIds[array_rand($userIds)],
                'current_department' => 'Consultation',
                'department_history' => null,
                'created_at' => $reg,
                'updated_at' => $now,
            ];
        }
        $this->insertRows('patient_waiting_times', $rows);

        // Patient attachments (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('patient_attachments', 30); $i++) {
            $rows[] = [
                'patient_id' => $patientIds[array_rand($patientIds)],
                'title' => 'Document ' . ($i + 1),
                'description' => 'Patient attachment file.',
                'path' => 'attachments/patient_' . $patientIds[array_rand($patientIds)] . '_' . ($i + 1) . '.pdf',
                'created_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('patient_attachments', $rows);

        // Patient notifications (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('patient_notifications', 30); $i++) {
            $rows[] = [
                'patient_id' => $patientIds[array_rand($patientIds)],
                'type' => $this->pick(['appointment', 'lab_result', 'prescription', 'billing', 'general']),
                'title' => 'Notification ' . ($i + 1),
                'message' => 'You have a new notification from Polyclinic HMS.',
                'data' => null,
                'status' => rand(0, 1) ? 'read' : 'unread',
                'read_at' => rand(0, 1) ? $this->ts(rand(1, 30)) : null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('patient_notifications', $rows);
    }

    private function seedClinical()
    {
        $now = $this->now->toDateTimeString();
        $userIds = DB::table('users')->pluck('id')->all();
        $patientIds = DB::table('patients')->pluck('id')->all();
        $diseaseIds = DB::table('diseases')->pluck('id')->all();
        $consultationTypeIds = DB::table('consultation_types')->pluck('id')->all();
        $doctorIds = $this->userIds(['Doctor']);
        $nurseIds = $this->userIds(['Nurse']);
        $adminId = DB::table('users')->where('role', 'Admin')->value('id') ?: 1;
        $paymentCacheItemIds = DB::table('patient_payment_cache_items')->pluck('id')->all();
        $cacheItemByPatient = DB::table('patient_payment_cache_items as pci')
            ->join('patient_payment_cache as pc', 'pc.id', '=', 'pci.payment_cache_id')
            ->join('patient_check_ins as pci2', 'pci2.id', '=', 'pc.check_in_id')
            ->select('pci.id as item_id', 'pci2.patient_id')
            ->get();

        // Appointments (30 total)
        $rows = [];
        for ($i = 0; $i < $this->needed('appointments', 30); $i++) {
            $gender = rand(0, 1) ? 'Male' : 'Female';
            $first = $gender === 'Male' ? $this->pick($this->maleNames) : $this->pick($this->femaleNames);
            $last = $this->pick($this->lastNames);
            $rows[] = [
                'first_name' => $first,
                'last_name' => $last,
                'email' => strtolower($first) . ($i + 1) . '@example.com',
                'phone' => $this->pick($this->phoneBase),
                'preferred_date' => Carbon::now()->addDays(rand(0, 30))->toDateString(),
                'preferred_time' => Carbon::createFromTime(rand(8, 17), rand(0, 59))->format('H:i:s'),
                'reason' => $this->pick(['General checkup', 'Follow-up visit', 'Laboratory test', 'Consultation', 'Eye examination']),
                'message' => 'Please confirm my appointment.',
                'status' => $this->pick(['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled']),
                'admin_reply' => rand(0, 1) ? 'Confirmed. Please arrive 30 minutes early.' : null,
                'replied_by' => rand(0, 1) ? $adminId : null,
                'replied_at' => rand(0, 1) ? $this->ts(rand(1, 30)) : null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('appointments', $rows);

        // Consultations (30 total) - need payment_cache_item per consultation
        $consultationRows = [];
        $consultationPatientMap = [];
        $existing = $this->countOf('consultations');
        for ($i = $existing; $i < 30; $i++) {
            $patientId = $patientIds[array_rand($patientIds)];
            $cacheItem = $cacheItemByPatient->where('patient_id', $patientId)->first();
            $consultationRows[] = [
                'payment_cache_item_id' => $cacheItem ? $cacheItem->item_id : $paymentCacheItemIds[array_rand($paymentCacheItemIds)],
                'patient_direction' => $this->pick(['Direct to Doctor', 'Direct to Optician', 'Sent to Optician']),
                'chief_complaint' => $this->pick(['Headache', 'Fever', 'Cough', 'Abdominal pain', 'Blurred vision', 'Body weakness']),
                'history_present_illness' => 'Patient presents with the above complaint for the past few days.',
                'family_history' => null,
                'general_health' => 'Generally good health.',
                'family_ocular_history' => null,
                'family_general_history' => null,
                'pupils' => 'Equal and reactive to light.',
                'extra_ocular_muscles' => 'Full and conjugate.',
                'patient_to_return' => rand(0, 3) === 0 ? 'Yes' : 'No',
                'to_return_date' => rand(0, 3) === 0 ? Carbon::now()->addDays(rand(7, 30))->toDateString() : null,
                'return_reason' => null,
                'remarks' => null,
                'doctor_recommendations' => 'Continue prescribed medication and return for review.',
                'doctor_comments_remarks' => null,
                'created_at' => $this->ts(rand(0, 90)),
                'created_by' => $doctorIds[array_rand($doctorIds)],
                'status' => rand(0, 3) === 0 ? 'Pending' : 'Consulted',
                'require_glass' => rand(0, 4) === 0 ? 'Yes' : 'No',
                'lens_types' => null,
                'sent_to_optician_at' => null,
                'sent_to_optician_by' => null,
                'optician_completed_at' => null,
                'updated_at' => $now,
            ];
            $consultationPatientMap[$i] = $patientId;
        }
        $this->insertRows('consultations', $consultationRows);

        $consultationIds = DB::table('consultations')->pluck('id')->all();

        // Consultation diagnoses (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('consultation_diagnoses', 30); $i++) {
            $rows[] = [
                'consultation_id' => $consultationIds[array_rand($consultationIds)],
                'disease_id' => $diseaseIds[array_rand($diseaseIds)],
                'diagnosis_type' => $this->pick(['Preliminary', 'Final']),
                'created_by' => $doctorIds[array_rand($doctorIds)],
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('consultation_diagnoses', $rows);

        // External examinations (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('consultation_external_examinations', 30); $i++) {
            $rows[] = [
                'consultation_id' => $consultationIds[array_rand($consultationIds)],
                're_lid' => 'Normal', 're_sclera' => 'White', 're_cornea' => 'Clear', 're_conjuctiva' => 'Pink',
                're_iris' => 'Normal', 're_pupil' => 'Reactive', 're_lens' => 'Clear', 're_iop' => '14 mmHg',
                'le_lid' => 'Normal', 'le_sclera' => 'White', 'le_cornea' => 'Clear', 'le_conjuctiva' => 'Pink',
                'le_iris' => 'Normal', 'le_pupil' => 'Reactive', 'le_lens' => 'Clear', 'le_iop' => '14 mmHg',
                'created_by' => $doctorIds[array_rand($doctorIds)],
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('consultation_external_examinations', $rows);

        // Functional tests (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('consultation_functional_tests', 30); $i++) {
            $rows[] = [
                'consultation_id' => $consultationIds[array_rand($consultationIds)],
                're_npc' => '60mm', 're_npa' => '0', 're_confrontation' => 'Full', 're_cover_test' => 'Orthophoric',
                'le_npc' => '60mm', 'le_npa' => '0', 'le_confrontation' => 'Full', 'le_cover_test' => 'Orthophoric',
                'created_by' => $doctorIds[array_rand($doctorIds)],
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('consultation_functional_tests', $rows);

        // Fundoscopies (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('consultation_fundoscopies', 30); $i++) {
            $rows[] = [
                'consultation_id' => $consultationIds[array_rand($consultationIds)],
                're' => 'Normal disc, clear media',
                'le' => 'Normal disc, clear media',
                'created_by' => $doctorIds[array_rand($doctorIds)],
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('consultation_fundoscopies', $rows);

        // Refractions (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('consultation_refractions', 30); $i++) {
            $rows[] = [
                'consultation_id' => $consultationIds[array_rand($consultationIds)],
                'ob_re_sph' => '-1.50', 'ob_re_cyl' => '-0.50', 'ob_re_axis' => '180', 'ob_re_va' => '6/6',
                'ob_le_sph' => '-1.25', 'ob_le_cyl' => '-0.50', 'ob_le_axis' => '175', 'ob_le_va' => '6/6',
                'sub_re_sph' => '-1.50', 'sub_re_cyl' => '-0.50', 'sub_re_axis' => '180', 'sub_re_va' => '6/6',
                'sub_re_add' => '+1.50', 'sub_re_add_va' => '6/6',
                'sub_le_sph' => '-1.25', 'sub_le_cyl' => '-0.50', 'sub_le_axis' => '175', 'sub_le_va' => '6/6',
                'sub_le_add' => '+1.50', 'sub_le_add_va' => '6/6',
                'created_by' => $doctorIds[array_rand($doctorIds)],
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('consultation_refractions', $rows);

        // Visual acuities (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('consultation_visual_acuities', 30); $i++) {
            $rows[] = [
                'consultation_id' => $consultationIds[array_rand($consultationIds)],
                'unaided_re_va' => '6/12', 'unaided_re_ph' => '6/6', 'unaided_ipd' => '62mm', 'unaided_le_va' => '6/12',
                'unaided_le_ph' => '6/6', 'aided_re_va' => '6/6', 'aided_re_va_description' => 'With correction',
                'aided_le_va' => '6/6', 'aided_le_va_description' => 'With correction',
                'created_by' => $doctorIds[array_rand($doctorIds)],
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('consultation_visual_acuities', $rows);

        // Vital signs (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('vital_signs', 30); $i++) {
            $rows[] = [
                'clinic_id' => 1,
                'patient_id' => $patientIds[array_rand($patientIds)],
                'consultation_id' => $consultationIds[array_rand($consultationIds)],
                'triaged_by' => $nurseIds[array_rand($nurseIds)],
                'temperature' => rand(360, 395) / 10,
                'systolic_bp' => rand(100, 150),
                'diastolic_bp' => rand(60, 95),
                'heart_rate' => rand(60, 100),
                'respiratory_rate' => rand(12, 20),
                'oxygen_saturation' => rand(95, 100),
                'weight_kg' => rand(400, 1000) / 10,
                'height_cm' => rand(120, 185),
                'bmi' => rand(180, 320) / 10,
                'blood_group' => $this->pick(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
                'chief_complaint' => 'Patient attending routine triage.',
                'triage_category' => $this->pick(['General', 'Urgent', 'Emergency']),
                'notes' => null,
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('vital_signs', $rows);

        // Prescriptions (30 total)
        $prescriptionRows = [];
        $existing = $this->countOf('prescriptions');
        for ($i = $existing; $i < 30; $i++) {
            $patientId = $patientIds[array_rand($patientIds)];
            $prescriptionRows[] = [
                'prescription_no' => 'RX-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'patient_id' => $patientId,
                'consultation_id' => $consultationIds[array_rand($consultationIds)],
                'prescribed_by' => $doctorIds[array_rand($doctorIds)],
                'date_prescribed' => $this->ts(rand(0, 60)),
                'diagnosis' => 'General consultation diagnosis',
                'clinical_notes' => 'Prescribed during consultation.',
                'status' => $this->pick(['Active', 'Partially Dispensed', 'Dispensed', 'Expired']),
                'expires_at' => Carbon::now()->addDays(rand(7, 90))->toDateString(),
                'cancel_reason' => null,
                'cancelled_by' => null,
                'cancelled_at' => null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('prescriptions', $prescriptionRows);

        $prescriptionIds = DB::table('prescriptions')->pluck('id')->all();
        $itemIds = DB::table('items')->pluck('id')->all();
        $rows = [];
        $existing = $this->countOf('prescription_items');
        for ($i = $existing; $i < 30; $i++) {
            $rows[] = [
                'prescription_id' => $prescriptionIds[array_rand($prescriptionIds)],
                'medicine_id' => $itemIds[array_rand($itemIds)],
                'medicine_name' => DB::table('items')->where('id', $itemIds[array_rand($itemIds)])->value('name'),
                'dosage' => '1 tablet',
                'frequency' => $this->pick(['BD', 'TDS', 'OD', 'QID']),
                'duration' => (string) rand(3, 14),
                'duration_unit' => 'days',
                'quantity' => rand(1, 30),
                'unit' => 'Tab',
                'meal' => $this->pick(['None', 'Before', 'After']),
                'instructions' => 'Take as directed.',
                'status' => $this->pick(['Pending', 'Partially Dispensed', 'Dispensed']),
                'dispensed_qty' => rand(0, 30),
                'dispensed_at' => rand(0, 1) ? $this->ts(rand(1, 30)) : null,
                'dispensed_by' => rand(0, 1) ? $userIds[array_rand($userIds)] : null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('prescription_items', $rows);

        // Medicine taking (30)
        $medicineIds = DB::table('medicines')->pluck('id')->all();
        $rows = [];
        for ($i = 0; $i < $this->needed('medicine_taking', 30); $i++) {
            $rows[] = [
                'clinic_id' => 1,
                'patient_id' => $patientIds[array_rand($patientIds)],
                'medicine_id' => $medicineIds[array_rand($medicineIds)],
                'dosage' => '1 tablet',
                'scheduled_date' => Carbon::now()->addDays(rand(-7, 7))->toDateString(),
                'scheduled_time' => Carbon::createFromTime(rand(6, 22), rand(0, 59))->format('H:i:s'),
                'taken_at' => rand(0, 1) ? $this->ts(rand(0, 30)) : null,
                'status' => $this->pick(['Pending', 'Completed', 'Missed']),
                'notes' => null,
                'created_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('medicine_taking', $rows);

        // Lab requests (30 total)
        $labRequestRows = [];
        $existing = $this->countOf('lab_requests');
        for ($i = $existing; $i < 30; $i++) {
            $labRequestRows[] = [
                'request_no' => 'LAB-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'patient_id' => $patientIds[array_rand($patientIds)],
                'consultation_id' => $consultationIds[array_rand($consultationIds)],
                'requested_by' => $doctorIds[array_rand($doctorIds)],
                'priority' => $this->pick(['Routine', 'Urgent', 'Stat']),
                'status' => $this->pick(['Pending', 'In Progress', 'Completed', 'Cancelled']),
                'clinical_notes' => 'Routine laboratory investigation.',
                'sample_collected_at' => rand(0, 1) ? $this->ts(rand(0, 30)) : null,
                'sample_collected_by' => $userIds[array_rand($userIds)],
                'completed_at' => rand(0, 1) ? $this->ts(rand(0, 30)) : null,
                'completed_by' => $userIds[array_rand($userIds)],
                'cancel_reason' => null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('lab_requests', $labRequestRows);

        $labRequestIds = DB::table('lab_requests')->pluck('id')->all();
        $labTestIds = DB::table('lab_tests')->pluck('id')->all();
        $rows = [];
        $existing = $this->countOf('lab_request_tests');
        for ($i = $existing; $i < 30; $i++) {
            $labTestId = $labTestIds[array_rand($labTestIds)];
            $test = DB::table('lab_tests')->where('id', $labTestId)->first();
            $rows[] = [
                'lab_request_id' => $labRequestIds[array_rand($labRequestIds)],
                'lab_test_id' => $labTestId,
                'status' => $this->pick(['Pending', 'Collected', 'Completed']),
                'result' => rand(0, 1) ? (string) rand(1, 500) : null,
                'unit' => $test->unit ?? null,
                'reference_range' => $test->reference_range ?? null,
                'is_abnormal' => rand(0, 4) === 0 ? 1 : 0,
                'interpretation' => rand(0, 1) ? 'Within normal limits.' : null,
                'result_entered_at' => rand(0, 1) ? $this->ts(rand(0, 30)) : null,
                'result_entered_by' => $userIds[array_rand($userIds)],
                'status_updated_by' => null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('lab_request_tests', $rows);

        // Radiology requests (30 total)
        $radRequestRows = [];
        $existing = $this->countOf('radiology_requests');
        for ($i = $existing; $i < 30; $i++) {
            $radRequestRows[] = [
                'request_no' => 'RAD-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'patient_id' => $patientIds[array_rand($patientIds)],
                'consultation_id' => $consultationIds[array_rand($consultationIds)],
                'requested_by' => $doctorIds[array_rand($doctorIds)],
                'priority' => $this->pick(['Routine', 'Urgent', 'Stat']),
                'status' => $this->pick(['Pending', 'In Progress', 'Completed', 'Cancelled']),
                'clinical_notes' => 'Routine imaging request.',
                'contrast' => $this->pick(['None', 'Oral', 'IV']),
                'performed_at' => rand(0, 1) ? $this->ts(rand(0, 30)) : null,
                'performed_by' => $userIds[array_rand($userIds)],
                'completed_at' => rand(0, 1) ? $this->ts(rand(0, 30)) : null,
                'completed_by' => $userIds[array_rand($userIds)],
                'cancel_reason' => null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('radiology_requests', $radRequestRows);

        $radRequestIds = DB::table('radiology_requests')->pluck('id')->all();
        $radExamIds = DB::table('radiology_exams')->pluck('id')->all();
        $rows = [];
        for ($i = 0; $i < $this->needed('radiology_request_exams', 30); $i++) {
            $rows[] = [
                'radiology_request_id' => $radRequestIds[array_rand($radRequestIds)],
                'radiology_exam_id' => $radExamIds[array_rand($radExamIds)],
                'status' => $this->pick(['Pending', 'Performed', 'Completed']),
                'findings' => rand(0, 1) ? 'Normal findings.' : null,
                'impression' => rand(0, 1) ? 'No significant abnormality.' : null,
                'conclusion' => rand(0, 1) ? 'Normal study.' : null,
                'result_entered_at' => rand(0, 1) ? $this->ts(rand(0, 30)) : null,
                'result_entered_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('radiology_request_exams', $rows);

        // Referrals (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('referrals', 30); $i++) {
            $rows[] = [
                'consultation_id' => $consultationIds[array_rand($consultationIds)],
                'patient_id' => $patientIds[array_rand($patientIds)],
                'referred_to_name' => $this->pick(['Muhimbili National Hospital', 'Bugando Medical Centre', 'Aga Khan Hospital', 'MNH Eye Unit', 'Regional Referral Hospital']),
                'referred_to_type' => $this->pick(['Hospital', 'Specialist', 'Eye Clinic']),
                'referral_reason' => 'Patient requires specialist assessment.',
                'clinical_summary' => 'Clinical summary of the case.',
                'status' => $this->pick(['Pending', 'Sent', 'Acknowledged', 'Completed']),
                'referral_date' => Carbon::now()->subDays(rand(0, 30))->toDateString(),
                'appointment_date' => Carbon::now()->addDays(rand(0, 30))->toDateString(),
                'notes' => null,
                'created_by' => $doctorIds[array_rand($doctorIds)],
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('referrals', $rows);

        // Doctor tasks (30 total)
        $rows = [];
        $existing = $this->countOf('doctor_tasks');
        for ($i = $existing; $i < 30; $i++) {
            $rows[] = [
                'doctor_id' => $doctorIds[array_rand($doctorIds)],
                'patient_id' => $patientIds[array_rand($patientIds)],
                'consultation_id' => $consultationIds[array_rand($consultationIds)],
                'task_type' => $this->pick(['Consultation', 'Procedure', 'Follow-up', 'Review']),
                'treatment_details' => 'Doctor task for patient care.',
                'status' => $this->pick(['pending', 'in_progress', 'completed']),
                'assigned_at' => $this->ts(rand(0, 30)),
                'started_at' => rand(0, 1) ? $this->ts(rand(0, 15)) : null,
                'completed_at' => rand(0, 1) ? $this->ts(rand(0, 10)) : null,
                'notes' => null,
                'assigned_by' => $adminId,
                'created_at' => $this->ts(rand(0, 30)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('doctor_tasks', $rows);
    }

    private function seedInpatient()
    {
        $now = $this->now->toDateTimeString();
        $patientIds = DB::table('patients')->pluck('id')->all();
        $bedIds = DB::table('beds')->pluck('id')->all();
        $wardIds = DB::table('hospital_wards')->pluck('id')->all();
        $doctorIds = $this->userIds(['Doctor']);
        $nurseIds = $this->userIds(['Nurse']);
        $adminId = DB::table('users')->where('role', 'Admin')->value('id') ?: 1;
        $userIds = DB::table('users')->pluck('id')->all();
        $paymentModeIds = DB::table('payment_modes')->pluck('id')->all();

        // Extra beds to reach 30
        $rows = [];
        $wardIdList = DB::table('hospital_wards')->pluck('id')->all();
        $existingBeds = $this->countOf('beds');
        for ($i = $existingBeds; $i < 30; $i++) {
            $wardId = $wardIdList[$i % count($wardIdList)];
            $rows[] = [
                'clinic_id' => 1,
                'hospital_ward_id' => $wardId,
                'bed_number' => 'BED-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                'bed_type' => $this->pick(['Regular', 'Private', 'ICU']),
                'status' => 'Available',
                'patient_id' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        $this->insertRows('beds', $rows);

        // Admissions (30 total) - mix of Admitted and Discharged
        $admissionRows = [];
        $existing = $this->countOf('admissions');
        $newCount = $this->needed('admissions', 30);
        for ($i = 0; $i < $newCount; $i++) {
            $discharged = $i < 20 ? 1 : 0;
            $admitDate = Carbon::now()->subDays(rand(1, 40));
            $rows = [
                'admission_no' => 'ADM-' . str_pad($existing + $i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'patient_id' => $patientIds[array_rand($patientIds)],
                'hospital_ward_id' => $wardIdList[array_rand($wardIdList)],
                'bed_id' => $bedIds[array_rand($bedIds)],
                'admitted_by' => $doctorIds[array_rand($doctorIds)],
                'doctor_id' => $doctorIds[array_rand($doctorIds)],
                'admission_date' => $admitDate->toDateTimeString(),
                'admission_reason' => $this->pick(['Pneumonia', 'Malaria', 'Surgical procedure', 'Observation', 'Trauma']),
                'diagnosis' => 'Admission diagnosis',
                'condition' => $this->pick(['Stable', 'Serious', 'Critical']),
                'notes' => null,
                'discharge_reason' => $discharged ? 'Condition improved' : null,
                'discharge_notes' => $discharged ? 'Discharged with follow-up plan.' : null,
                'discharged_by' => $discharged ? $doctorIds[array_rand($doctorIds)] : null,
                'discharge_date' => $discharged ? $admitDate->addDays(rand(1, 10))->toDateTimeString() : null,
                'status' => $discharged ? 'Discharged' : 'Admitted',
                'created_at' => $admitDate->toDateTimeString(),
                'updated_at' => $now,
            ];
            $admissionRows[] = $rows;
        }
        $this->insertUnique('admissions', $admissionRows);

        $admissionIds = DB::table('admissions')->pluck('id')->all();
        $admissionPatientMap = DB::table('admissions')->select('id', 'patient_id')->get();
        $dischargedAdmissionIds = DB::table('admissions')
            ->where('status', 'Discharged')
            ->whereNotIn('id', DB::table('discharge_summaries')->select('admission_id'))
            ->pluck('id')
            ->all();

        // Inpatient notes (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('inpatient_notes', 30); $i++) {
            $admission = $admissionPatientMap->random();
            $rows[] = [
                'clinic_id' => 1,
                'admission_id' => $admission->id,
                'patient_id' => $admission->patient_id,
                'noted_by' => $nurseIds[array_rand($nurseIds)],
                'note_type' => $this->pick(['Progress', 'Nursing', 'Physician', 'Procedure', 'Other']),
                'note_text' => 'Clinical note recorded for the patient.',
                'noted_at' => $this->ts(rand(0, 30)),
                'created_at' => $this->ts(rand(0, 30)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('inpatient_notes', $rows);

        // Discharge summaries (30) - one per discharged admission
        $dischargedAdmissionIds = DB::table('admissions')
            ->where('status', 'Discharged')
            ->whereNotIn('id', DB::table('discharge_summaries')->select('admission_id'))
            ->pluck('id')
            ->all();
        $need = $this->needed('discharge_summaries', 30);
        if (count($dischargedAdmissionIds) < $need) {
            $candidates = DB::table('admissions')
                ->whereNotIn('status', ['Discharged', 'Cancelled'])
                ->whereNotIn('id', DB::table('discharge_summaries')->select('admission_id'))
                ->orderBy('id')
                ->limit($need - count($dischargedAdmissionIds))
                ->get();
            foreach ($candidates as $admission) {
                DB::table('admissions')->where('id', $admission->id)->update(['status' => 'Discharged']);
                $dischargedAdmissionIds[] = $admission->id;
            }
        }
        $rows = [];
        $summaryCount = 0;
        foreach ($dischargedAdmissionIds as $admissionId) {
            if ($summaryCount >= $need) {
                break;
            }
            $admission = DB::table('admissions')->where('id', $admissionId)->first();
            $rows[] = [
                'clinic_id' => 1,
                'admission_id' => $admissionId,
                'patient_id' => $admission->patient_id,
                'admission_reason' => $admission->admission_reason,
                'diagnoses' => 'Primary diagnosis during admission.',
                'procedures' => 'None performed.',
                'medications' => 'Prescribed medications at discharge.',
                'follow_up_instructions' => 'Return for review in 2 weeks.',
                'discharge_condition' => $this->pick(['Stable', 'Improved', 'Recovered', 'Unchanged', 'Worsened']),
                'summary' => 'Patient made good progress and is being discharged with follow-up.',
                'doctor_id' => $doctorIds[array_rand($doctorIds)],
                'status' => $this->pick(['Draft', 'Finalized']),
                'prepared_at' => $this->ts(rand(0, 30)),
                'notes' => null,
                'created_at' => $this->ts(rand(0, 30)),
                'updated_at' => $now,
            ];
            $summaryCount++;
        }
        $this->insertRows('discharge_summaries', $rows);

        // Nursing charts (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('nursing_charts', 30); $i++) {
            $admission = $admissionPatientMap->random();
            $rows[] = [
                'clinic_id' => 1,
                'admission_id' => $admission->id,
                'patient_id' => $admission->patient_id,
                'chart_date' => Carbon::now()->subDays(rand(0, 20))->toDateString(),
                'shift' => $this->pick(['Morning', 'Evening', 'Night']),
                'temperature' => rand(360, 395) / 10,
                'pulse' => rand(60, 100),
                'respiration' => rand(12, 20),
                'blood_pressure' => rand(100, 150) . '/' . rand(60, 95),
                'spo2' => rand(95, 100),
                'blood_sugar' => rand(70, 140),
                'pain_level' => rand(0, 10),
                'nursing_notes' => 'Routine nursing observations.',
                'observations' => 'Patient stable.',
                'recorded_by' => $nurseIds[array_rand($nurseIds)],
                'recorded_at' => $this->ts(rand(0, 20)),
                'created_at' => $this->ts(rand(0, 20)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('nursing_charts', $rows);

        // Fluid balances (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('fluid_balances', 30); $i++) {
            $admission = $admissionPatientMap->random();
            $rows[] = [
                'clinic_id' => 1,
                'admission_id' => $admission->id,
                'patient_id' => $admission->patient_id,
                'balance_date' => Carbon::now()->subDays(rand(0, 20))->toDateString(),
                'shift' => $this->pick(['Morning', 'Evening', 'Night']),
                'intake_oral' => rand(500, 2000),
                'intake_iv' => rand(0, 1000),
                'intake_other' => rand(0, 500),
                'output_urine' => rand(400, 2000),
                'output_drain' => rand(0, 500),
                'output_other' => rand(0, 300),
                'recorded_by' => $nurseIds[array_rand($nurseIds)],
                'notes' => null,
                'created_at' => $this->ts(rand(0, 20)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('fluid_balances', $rows);

        // MAR entries (30)
        $medicines = ['Paracetamol 500mg', 'Amoxicillin 250mg', 'Metformin 500mg', 'Amlodipine 5mg', 'ORS Sachets', 'Ibuprofen 400mg'];
        $rows = [];
        for ($i = 0; $i < $this->needed('mar_entries', 30); $i++) {
            $admission = $admissionPatientMap->random();
            $status = $this->pick(['Scheduled', 'Given', 'Refused', 'Withheld']);
            $rows[] = [
                'clinic_id' => 1,
                'admission_id' => $admission->id,
                'patient_id' => $admission->patient_id,
                'medication_name' => $medicines[array_rand($medicines)],
                'dose' => '1 tablet',
                'route' => $this->pick(['Oral', 'IV', 'IM']),
                'scheduled_time' => $this->ts2(rand(0, 3)),
                'status' => $status,
                'given_at' => $status === 'Given' ? $this->ts(rand(0, 3)) : null,
                'given_by' => $status === 'Given' ? $nurseIds[array_rand($nurseIds)] : null,
                'reason_omitted' => $status === 'Withheld' ? 'Clinical decision' : null,
                'notes' => null,
                'created_at' => $this->ts(rand(0, 20)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('mar_entries', $rows);

        // ER visits (30 total)
        $rows = [];
        $existing = $this->countOf('er_visits');
        for ($i = $existing; $i < 30; $i++) {
            $status = $this->pick(['Waiting', 'In-Treatment', 'Admitted', 'Discharged', 'Referred', 'Cancelled']);
            $rows[] = [
                'visit_no' => 'ER-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'patient_id' => $patientIds[array_rand($patientIds)],
                'triaged_by' => $nurseIds[array_rand($nurseIds)],
                'doctor_id' => $doctorIds[array_rand($doctorIds)],
                'nurse_id' => $nurseIds[array_rand($nurseIds)],
                'arrival_time' => $this->ts(rand(0, 30)),
                'seen_time' => rand(0, 1) ? $this->ts(rand(0, 10)) : null,
                'discharge_time' => rand(0, 1) ? $this->ts(rand(0, 5)) : null,
                'triage_category' => $this->pick(['General', 'Urgent', 'Emergency']),
                'priority' => $this->pick(['Stable', 'Serious', 'Critical']),
                'chief_complaint' => 'Emergency presentation.',
                'history' => null,
                'assessment' => null,
                'diagnosis' => rand(0, 1) ? 'Acute condition' : null,
                'treatment' => rand(0, 1) ? 'Initial treatment given.' : null,
                'disposition' => rand(0, 1) ? $this->pick(['Admitted', 'Discharged', 'Referred', 'Observed', 'Died']) : null,
                'admission_id' => rand(0, 1) ? $admissionIds[array_rand($admissionIds)] : null,
                'referral_to' => null,
                'outcome' => null,
                'status' => $status,
                'notes' => null,
                'created_at' => $this->ts(rand(0, 30)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('er_visits', $rows);

        // Inpatient bills (30 total)
        $billRows = [];
        $existing = $this->countOf('inpatient_bills');
        for ($i = $existing; $i < 30; $i++) {
            $admission = $admissionPatientMap->random();
            $amount = rand(50000, 1500000);
            $discount = rand(0, 20000);
            $status = $this->pick(['Open', 'Partial', 'Paid', 'Void']);
            $billRows[] = [
                'bill_no' => 'IB-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'admission_id' => $admission->id,
                'patient_id' => $admission->patient_id,
                'amount' => $amount,
                'discount' => $discount,
                'total' => $amount - $discount,
                'status' => $status,
                'issued_at' => $this->ts(rand(0, 30)),
                'issued_by' => $adminId,
                'settled_at' => in_array($status, ['Paid', 'Partial']) ? $this->ts(rand(0, 20)) : null,
                'settled_by' => in_array($status, ['Paid', 'Partial']) ? $userIds[array_rand($userIds)] : null,
                'notes' => null,
                'created_at' => $this->ts(rand(0, 30)),
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('inpatient_bills', $billRows);

        $billIds = DB::table('inpatient_bills')->pluck('id')->all();

        // Inpatient charges (30 total)
        $rows = [];
        $existing = $this->countOf('inpatient_charges');
        for ($i = $existing; $i < 30; $i++) {
            $admission = $admissionPatientMap->random();
            $type = $this->pick(['Bed Day', 'Manual', 'Medication', 'Procedure']);
            $qty = rand(1, 10);
            $rows[] = [
                'clinic_id' => 1,
                'admission_id' => $admission->id,
                'patient_id' => $admission->patient_id,
                'charge_type' => $type,
                'description' => $type . ' charge',
                'charge_date' => Carbon::now()->subDays(rand(0, 30))->toDateString(),
                'unit_price' => rand(5000, 100000),
                'quantity' => $qty,
                'amount' => rand(5000, 100000) * $qty,
                'charged_by' => $userIds[array_rand($userIds)],
                'status' => $this->pick(['Pending', 'Billed', 'Void']),
                'billed_at_bill_id' => null,
                'voided_at' => null,
                'notes' => null,
                'created_at' => $this->ts(rand(0, 30)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('inpatient_charges', $rows);

        // Inpatient bill payments (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('inpatient_bill_payments', 30); $i++) {
            $bill = DB::table('inpatient_bills')->inRandomOrder()->first();
            $rows[] = [
                'bill_id' => $bill->id,
                'clinic_id' => 1,
                'amount' => rand(10000, 500000),
                'payment_date' => Carbon::now()->subDays(rand(0, 30))->toDateString(),
                'payment_mode_id' => $paymentModeIds[array_rand($paymentModeIds)],
                'recorded_by' => $userIds[array_rand($userIds)],
                'reference' => 'PAY' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'notes' => null,
                'created_at' => $this->ts(rand(0, 30)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('inpatient_bill_payments', $rows);

        // Patient item bills (30 total)
        $billRows = [];
        $existing = $this->countOf('patient_item_bills');
        for ($i = $existing; $i < 30; $i++) {
            $amount = rand(5000, 500000);
            $status = $this->pick(['Pending', 'Cleared']);
            $billRows[] = [
                'amount' => $amount,
                'discount' => rand(0, 10000),
                'created_by' => $userIds[array_rand($userIds)],
                'status' => $status,
                'cleared_at' => $status === 'Cleared' ? $this->ts(rand(0, 20)) : null,
                'cleared_by' => $status === 'Cleared' ? $userIds[array_rand($userIds)] : null,
                'created_at' => $this->ts(rand(0, 30)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('patient_item_bills', $billRows);

        // Patient item bill payments (30)
        $patientBillIds = DB::table('patient_item_bills')->pluck('id')->all();
        $channelIds = DB::table('payment_channels')->pluck('id')->all();
        $rows = [];
        for ($i = 0; $i < $this->needed('patient_item_bill_payments', 30); $i++) {
            $rows[] = [
                'bill_id' => $patientBillIds[array_rand($patientBillIds)],
                'channel_id' => $channelIds[array_rand($channelIds)],
                'amount' => rand(5000, 300000),
                'created_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 30)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('patient_item_bill_payments', $rows);
    }

    private function seedBloodAndAmbulance()
    {
        $now = $this->now->toDateTimeString();
        $patientIds = DB::table('patients')->pluck('id')->all();
        $userIds = DB::table('users')->pluck('id')->all();

        // Blood donors (30 total)
        $rows = [];
        $existing = $this->countOf('blood_donors');
        for ($i = $existing; $i < 30; $i++) {
            $gender = rand(0, 1) ? 'Male' : 'Female';
            $first = $gender === 'Male' ? $this->pick($this->maleNames) : $this->pick($this->femaleNames);
            $last = $this->pick($this->lastNames);
            $rows[] = [
                'clinic_id' => 1,
                'donor_no' => 'DNR-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'first_name' => $first,
                'last_name' => $last,
                'phone' => $this->pick($this->phoneBase),
                'email' => strtolower($first) . ($i + 1) . '@donor.co.tz',
                'date_of_birth' => Carbon::now()->subYears(rand(18, 55))->toDateString(),
                'gender' => $gender,
                'blood_group' => $this->pick(['A', 'B', 'O', 'AB']),
                'rh_factor' => rand(0, 9) === 0 ? 'Negative' : 'Positive',
                'national_id' => (string) rand(19800000000000, 19999999999999),
                'occupation' => DB::table('occupations')->inRandomOrder()->value('name'),
                'medical_history' => null,
                'status' => $this->pick(['Active', 'Deferred', 'Inactive']),
                'notes' => null,
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('blood_donors', $rows);

        $donorIds = DB::table('blood_donors')->pluck('id')->all();

        // Blood bank units (30 total)
        $rows = [];
        $existing = $this->countOf('blood_bank_units');
        for ($i = $existing; $i < 30; $i++) {
            $donor = DB::table('blood_donors')->inRandomOrder()->first();
            $rows[] = [
                'unit_no' => 'UNIT-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'donor_id' => $donor->id,
                'blood_group' => $donor->blood_group,
                'rh_factor' => $donor->rh_factor,
                'component_type' => $this->pick(['Whole Blood', 'Packed Cells', 'Plasma', 'Platelets', 'Cryoprecipitate']),
                'donation_date' => Carbon::now()->subDays(rand(0, 30))->toDateString(),
                'expiry_date' => Carbon::now()->addDays(rand(10, 35))->toDateString(),
                'volume_ml' => (string) rand(250, 500),
                'storage_location' => 'Fridge ' . rand(1, 4),
                'status' => $this->pick(['Available', 'Reserved', 'Cross-matched', 'Issued', 'Discarded', 'Expired']),
                'patient_id' => rand(0, 3) === 0 ? $patientIds[array_rand($patientIds)] : null,
                'reserved_at' => null,
                'issued_at' => null,
                'discard_reason' => null,
                'notes' => null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('blood_bank_units', $rows);

        // Transfusions (30)
        $unitIds = DB::table('blood_bank_units')->pluck('id')->all();
        $rows = [];
        for ($i = 0; $i < $this->needed('transfusions', 30); $i++) {
            $rows[] = [
                'transfusion_no' => 'TRF-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'patient_id' => $patientIds[array_rand($patientIds)],
                'unit_id' => $unitIds[array_rand($unitIds)],
                'requested_by' => $userIds[array_rand($userIds)],
                'administered_by' => $userIds[array_rand($userIds)],
                'indication' => $this->pick(['Anemia', 'Blood loss', 'Surgery', 'Thalassemia']),
                'cross_match' => $this->pick(['Pending', 'Compatible', 'Incompatible']),
                'cross_match_time' => $this->ts(rand(0, 30)),
                'started_at' => rand(0, 1) ? $this->ts(rand(0, 15)) : null,
                'ended_at' => rand(0, 1) ? $this->ts(rand(0, 10)) : null,
                'vitals_before' => 'BP 120/80, HR 80',
                'vitals_after' => 'BP 120/80, HR 80',
                'reaction' => $this->pick(['None', 'Febrile', 'Allergic', 'Hemolytic', 'Other']),
                'reaction_notes' => null,
                'outcome' => 'Completed successfully.',
                'status' => $this->pick(['Requested', 'Cross-matching', 'In-Progress', 'Completed', 'Cancelled']),
                'notes' => null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('transfusions', $rows);

        // Ambulance vehicles (30 total)
        $rows = [];
        $existing = $this->countOf('ambulance_vehicles');
        for ($i = $existing; $i < 30; $i++) {
            $rows[] = [
                'registration_no' => 'TZ ' . str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT) . ' ' . $this->pick(['A', 'B', 'C', 'D', 'E', 'F']) . $i,
                'clinic_id' => 1,
                'vehicle_type' => $this->pick(['Ambulance', 'Patient Van', 'Boat']),
                'model' => $this->pick(['Toyota Hiace', 'Nissan Urvan', 'Land Cruiser', 'Mercedes Sprinter', 'Ford Transit']),
                'capacity' => (string) rand(4, 10),
                'driver_name' => $this->pick($this->maleNames) . ' ' . $this->pick($this->lastNames),
                'driver_phone' => $this->pick($this->phoneBase),
                'attendant_name' => $this->pick($this->maleNames) . ' ' . $this->pick($this->lastNames),
                'attendant_phone' => $this->pick($this->phoneBase),
                'status' => $this->pick(['Available', 'On-Trip', 'Maintenance', 'Out-of-Service']),
                'equipment_notes' => 'Standard ambulance equipment.',
                'notes' => null,
                'created_at' => $this->ts(rand(0, 120)),
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('ambulance_vehicles', $rows);

        $vehicleIds = DB::table('ambulance_vehicles')->pluck('id')->all();

        // Ambulance requests (30)
        $requestRows = [];
        for ($i = 0; $i < $this->needed('ambulance_requests', 30); $i++) {
            $requestRows[] = [
                'request_no' => 'AMB-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'patient_id' => $patientIds[array_rand($patientIds)],
                'requested_by' => $userIds[array_rand($userIds)],
                'pickup_location' => 'Dar es Salaam area',
                'destination' => 'Polyclinic HMS',
                'pickup_time' => $this->ts(rand(0, 30)),
                'patient_condition' => $this->pick(['Stable', 'Moderate', 'Critical']),
                'transport_type' => $this->pick(['Emergency', 'Routine', 'Inter-facility', 'Discharge']),
                'special_requirements' => null,
                'status' => $this->pick(['Pending', 'Assigned', 'In-Progress', 'Completed', 'Cancelled']),
                'notes' => null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('ambulance_requests', $requestRows);

        $requestIds = DB::table('ambulance_requests')->pluck('id')->all();

        // Ambulance trips (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('ambulance_trips', 30); $i++) {
            $status = $this->pick(['Dispatched', 'En-Route', 'On-Scene', 'Transporting', 'Completed', 'Cancelled']);
            $rows[] = [
                'trip_no' => 'TRIP-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'request_id' => $requestIds[array_rand($requestIds)],
                'vehicle_id' => $vehicleIds[array_rand($vehicleIds)],
                'driver_id' => $userIds[array_rand($userIds)],
                'attendant_id' => $userIds[array_rand($userIds)],
                'dispatched_at' => $this->ts(rand(0, 30)),
                'arrived_at_pickup' => rand(0, 1) ? $this->ts(rand(0, 20)) : null,
                'departed_pickup' => rand(0, 1) ? $this->ts(rand(0, 15)) : null,
                'arrived_at_destination' => rand(0, 1) ? $this->ts(rand(0, 10)) : null,
                'distance_km' => rand(2, 50),
                'fuel_used_litres' => (string) rand(1, 20),
                'overtime_hours' => (string) rand(0, 3),
                'trip_report' => $status === 'Completed' ? 'Trip completed successfully.' : null,
                'status' => $status,
                'notes' => null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('ambulance_trips', $rows);
    }

    private function seedMortuaryAndTheatre()
    {
        $now = $this->now->toDateTimeString();
        $patientIds = DB::table('patients')->pluck('id')->all();
        $userIds = DB::table('users')->pluck('id')->all();
        $doctorIds = $this->userIds(['Doctor']);
        $nurseIds = $this->userIds(['Nurse']);
        $paymentCacheItemIds = DB::table('patient_payment_cache_items')->pluck('id')->all();
        $admissionIds = DB::table('admissions')->pluck('id')->all();
        $admissionPatientMap = DB::table('admissions')->select('id', 'patient_id')->get();

        // Mortuary bodies (30)
        $bodyRows = [];
        for ($i = 0; $i < $this->needed('mortuary_bodies', 30); $i++) {
            $gender = rand(0, 1) ? 'Male' : 'Female';
            $first = $gender === 'Male' ? $this->pick($this->maleNames) : $this->pick($this->femaleNames);
            $last = $this->pick($this->lastNames);
            $status = $this->pick(['In-Storage', 'Released', 'Cremated', 'Transferred']);
            $bodyRows[] = [
                'clinic_id' => 1,
                'body_no' => 'BDY-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'patient_id' => rand(0, 3) === 0 ? $patientIds[array_rand($patientIds)] : null,
                'deceased_name' => $first . ' ' . $last,
                'gender' => $gender,
                'age' => (string) rand(20, 90),
                'date_of_death' => $this->ts(rand(0, 30)),
                'cause_of_death' => $this->pick(['Cardiac arrest', 'Trauma', 'Respiratory failure', 'Unknown']),
                'admitted_at' => $this->ts(rand(0, 30)),
                'admitted_by' => $userIds[array_rand($userIds)],
                'storage_location' => 'Mortuary Rack ' . rand(1, 8),
                'status' => $status,
                'released_at' => in_array($status, ['Released', 'Cremated', 'Transferred']) ? $this->ts(rand(0, 20)) : null,
                'released_by' => in_array($status, ['Released', 'Cremated', 'Transferred']) ? $userIds[array_rand($userIds)] : null,
                'received_by_name' => $this->pick($this->maleNames) . ' ' . $this->pick($this->lastNames),
                'received_by_phone' => $this->pick($this->phoneBase),
                'notes' => null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('mortuary_bodies', $bodyRows);

        $bodyIds = DB::table('mortuary_bodies')->pluck('id')->all();

        // Death certificates (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('death_certificates', 30); $i++) {
            $body = DB::table('mortuary_bodies')->inRandomOrder()->first();
            $rows[] = [
                'certificate_no' => 'DC-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'body_id' => $body->id,
                'patient_id' => $body->patient_id,
                'deceased_name' => $body->deceased_name,
                'gender' => $body->gender,
                'date_of_birth' => Carbon::now()->subYears(rand(20, 90))->toDateString(),
                'date_of_death' => $body->date_of_death,
                'place_of_death' => 'Polyclinic HMS',
                'cause_of_death' => $body->cause_of_death,
                'doctor_id' => $doctorIds[array_rand($doctorIds)],
                'issued_at' => rand(0, 1) ? $this->ts(rand(0, 20)) : null,
                'status' => $this->pick(['Draft', 'Issued', 'Void']),
                'notes' => null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('death_certificates', $rows);

        // Operating theatres (30 total)
        $rows = [];
        $existing = $this->countOf('operating_theatres');
        for ($i = $existing; $i < 30; $i++) {
            $rows[] = [
                'clinic_id' => 1,
                'name' => 'Theatre ' . ($i + 1),
                'location' => 'Block ' . chr(65 + ($i % 5)) . ', Floor ' . (($i % 3) + 1),
                'equipment_notes' => 'Standard theatre equipment.',
                'status' => $this->pick(['Active', 'Inactive', 'Maintenance']),
                'notes' => null,
                'created_at' => $this->ts(rand(0, 180)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('operating_theatres', $rows);

        $theatreIds = DB::table('operating_theatres')->pluck('id')->all();

        // Surgeries (30)
        $surgeryRows = [];
        $procedureNames = ['Appendectomy', 'Hernia Repair', 'Caesarean Section', 'Cataract Extraction', 'Tonsillectomy',
            'Cholecystectomy', 'Fracture Fixation', 'Laparotomy', 'Wound Debridement', 'Cesarean Delivery',
            'Hysterectomy', 'Prostatectomy', 'Tubal Ligation', 'Cystoscopy', 'Septoplasty', 'Mastectomy',
            'Thyroidectomy', 'Orchidopexy', 'Anal Fissurectomy', 'Lipoma Excision', 'Pilonidal Sinus Excision',
            'Inguinal Hernia Repair', 'Umbilical Hernia Repair', 'Varicose Vein Surgery', 'Bunionectomy',
            'Carpal Tunnel Release', 'Knee Arthroscopy', 'Shoulder Repair', 'ACL Reconstruction', 'Spinal Fusion'];
        for ($i = 0; $i < $this->needed('surgeries', 30); $i++) {
            $admission = $admissionPatientMap->random();
            $status = $this->pick(['Scheduled', 'Ready', 'In-Progress', 'Completed', 'Postponed', 'Cancelled']);
            $surgeryRows[] = [
                'surgery_no' => 'SUR-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'patient_id' => $admission->patient_id,
                'theatre_id' => $theatreIds[array_rand($theatreIds)],
                'admission_id' => $admission->id,
                'surgeon_id' => $doctorIds[array_rand($doctorIds)],
                'assistant_surgeon_id' => $doctorIds[array_rand($doctorIds)],
                'anesthesiologist_id' => $doctorIds[array_rand($doctorIds)],
                'scrub_nurse_id' => $nurseIds[array_rand($nurseIds)],
                'procedure_name' => $procedureNames[$i % count($procedureNames)],
                'procedure_type' => $this->pick(['Elective', 'Emergency', 'Urgent']),
                'scheduled_at' => $this->ts2(rand(0, 30)),
                'started_at' => in_array($status, ['In-Progress', 'Completed']) ? $this->ts(rand(0, 20)) : null,
                'ended_at' => $status === 'Completed' ? $this->ts(rand(0, 10)) : null,
                'duration_minutes' => $status === 'Completed' ? rand(30, 240) : null,
                'pre_op_diagnosis' => 'Pre-operative diagnosis',
                'post_op_diagnosis' => $status === 'Completed' ? 'Post-operative diagnosis' : null,
                'pre_op_notes' => 'Patient prepared for surgery.',
                'intra_op_notes' => null,
                'post_op_notes' => $status === 'Completed' ? 'Patient transferred to recovery.' : null,
                'blood_loss_ml' => (string) rand(50, 800),
                'complications' => null,
                'outcome' => $status === 'Completed' ? 'Surgery successful.' : null,
                'status' => $status,
                'cancel_reason' => in_array($status, ['Postponed', 'Cancelled']) ? 'Operational reason' : null,
                'created_by' => $userIds[array_rand($userIds)],
                'notes' => null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('surgeries', $surgeryRows);

        $surgeryIds = DB::table('surgeries')->pluck('id')->all();
        $surgeryPatientMap = DB::table('surgeries')->select('id', 'patient_id')->get();

        // Surgical notes (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('surgical_notes', 30); $i++) {
            $surgery = $surgeryPatientMap->random();
            $rows[] = [
                'clinic_id' => 1,
                'surgery_id' => $surgery->id,
                'author_id' => $doctorIds[array_rand($doctorIds)],
                'note_type' => $this->pick(['Pre-op', 'Intra-op', 'Post-op', 'Other']),
                'note' => 'Surgical note for the procedure.',
                'created_at' => $this->ts(rand(0, 30)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('surgical_notes', $rows);

        // Anesthesia records (30)
        $anesthesiaRows = [];
        for ($i = 0; $i < $this->needed('anesthesia_records', 30); $i++) {
            $surgery = $surgeryPatientMap->random();
            $anesthesiaRows[] = [
                'record_no' => 'AN-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'patient_id' => $surgery->patient_id,
                'surgery_id' => $surgery->id,
                'admission_id' => $admissionIds[array_rand($admissionIds)],
                'anesthesiologist_id' => $doctorIds[array_rand($doctorIds)],
                'anesthesia_type' => $this->pick(['General', 'Regional', 'Local', 'Sedation']),
                'asa_class' => $this->pick(['ASA I', 'ASA II', 'ASA III', 'ASA IV']),
                'airway' => $this->pick(['ETT', 'LMA', 'Mask', 'Other']),
                'fasting_hours' => (string) rand(2, 12),
                'allergies' => null,
                'pre_op_assessment' => 'Pre-operative assessment completed.',
                'induction_agent' => $this->pick(['Propofol', 'Thiopental', 'Ketamine', 'Etomidate']),
                'maintenance_agents' => 'Sevoflurane with oxygen.',
                'reversal_agents' => 'Neostigmine and atropine.',
                'iv_fluids_ml' => (string) rand(500, 3000),
                'blood_transfusion_ml' => (string) rand(0, 1000),
                'urine_output_ml' => (string) rand(50, 800),
                'blood_loss_ml' => (string) rand(20, 600),
                'induction_time' => $this->ts(rand(0, 20)),
                'emergence_time' => rand(0, 1) ? $this->ts(rand(0, 10)) : null,
                'recovery_time' => rand(0, 1) ? $this->ts(rand(0, 8)) : null,
                'intraop_complications' => null,
                'postop_complications' => null,
                'postop_instructions' => 'Monitor vitals in recovery.',
                'status' => $this->pick(['In-Progress', 'Completed', 'Cancelled']),
                'created_by' => $userIds[array_rand($userIds)],
                'notes' => null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('anesthesia_records', $anesthesiaRows);

        $anesthesiaIds = DB::table('anesthesia_records')->pluck('id')->all();

        // Anesthesia vitals (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('anesthesia_vitals', 30); $i++) {
            $rows[] = [
                'anesthesia_record_id' => $anesthesiaIds[array_rand($anesthesiaIds)],
                'recorded_at' => $this->ts(rand(0, 20)),
                'heart_rate' => (string) rand(60, 110),
                'blood_pressure' => rand(100, 150) . '/' . rand(60, 95),
                'oxygen_saturation' => (string) rand(95, 100),
                'respiratory_rate' => (string) rand(12, 22),
                'temperature' => (string) (rand(360, 375) / 10),
                'etco2' => (string) rand(30, 45),
                'notes' => null,
                'created_at' => $this->ts(rand(0, 20)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('anesthesia_vitals', $rows);

        // Cataract surgery records (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('cataract_surgery_records', 30); $i++) {
            $rows[] = [
                'payment_cache_item_id' => $paymentCacheItemIds[array_rand($paymentCacheItemIds)],
                'unaided_re_va' => '6/36', 'unaided_le_va' => '6/9',
                'aided_re_va' => '6/18', 'aided_le_va' => '6/6',
                'lens_examination_re' => 'Cataract', 'lens_examination_le' => 'Clear',
                'other_ocular_pathology' => 'None', 'other_ocular_pathology_specify' => null,
                'clinical_data' => 'Age-related cataract noted in right eye.',
                'operated_eye' => 'Right',
                'operated_eye_refraction_sph' => '-2.00', 'operated_eye_refraction_sph_postop' => '-0.50',
                'operated_eye_refraction_cyl' => '-0.75', 'operated_eye_refraction_axis' => '180',
                'operated_eye_biometry_k1' => '43.5', 'operated_eye_biometry_k2' => '44.0',
                'operated_eye_biometry_axial_length' => '23.5',
                'operation_date' => Carbon::now()->subDays(rand(0, 60))->toDateString(),
                'operation_place' => 'Polyclinic HMS Theatre 1',
                'surgery_type' => 'Phacoemulsification',
                'iol' => 'IOL implant',
                'hospital_id' => 'HMS-001',
                'surgeon_id' => (string) $doctorIds[array_rand($doctorIds)],
                'training' => 'Surgical trainee',
                'operative_complications' => 'None',
                'section' => 'Corneal',
                'capsulotomy' => 'CCC',
                'iol_type' => 'Foldable',
                'iol_power' => '+20.5',
                'suture' => 'None',
                'number_of_sutures' => '0',
                'postoperative_data' => 'Recovering well post-operatively.',
                'created_by' => $doctorIds[array_rand($doctorIds)],
                'status' => $this->pick(['Draft', 'Saved']),
                'saved_at' => rand(0, 1) ? $this->ts(rand(0, 30)) : null,
                'saved_by' => rand(0, 1) ? $doctorIds[array_rand($doctorIds)] : null,
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('cataract_surgery_records', $rows);

        // Surgery record reports (30 total)
        $rows = [];
        $existing = $this->countOf('surgery_record_reports');
        for ($i = $existing; $i < 30; $i++) {
            $rows[] = [
                'payment_cache_item_id' => $paymentCacheItemIds[array_rand($paymentCacheItemIds)],
                'unaided_re_va' => '6/36', 'unaided_le_va' => '6/12',
                'aided_re_va' => '6/12', 'aided_le_va' => '6/6',
                'surgeon' => 'Dr. ' . $this->pick($this->lastNames),
                'assistant_surgeon' => 'Dr. ' . $this->pick($this->lastNames),
                'scrub_nurse' => 'Nurse ' . $this->pick($this->lastNames),
                'operation_type' => 'Cataract Surgery',
                'anaesthesia_type' => 'Local',
                'operated_eye' => 'Left',
                'intraoperative_notes' => 'Procedure uneventful.',
                'postoperative_management' => 'Post-op medications prescribed.',
                'remarks' => 'Patient stable.',
                'created_by' => $doctorIds[array_rand($doctorIds)],
                'status' => $this->pick(['Draft', 'Saved']),
                'saved_at' => rand(0, 1) ? $this->ts(rand(0, 30)) : null,
                'saved_by' => rand(0, 1) ? $doctorIds[array_rand($doctorIds)] : null,
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('surgery_record_reports', $rows);

        // Stocktakes (30)
        $stocktakeRows = [];
        for ($i = 0; $i < $this->needed('stocktakes', 30); $i++) {
            $stocktakeRows[] = [
                'created_by' => $userIds[array_rand($userIds)],
                'reason' => 'Monthly stock verification',
                'status' => $this->pick(['Pending', 'Applied']),
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('stocktakes', $stocktakeRows);

        // Stocktake items (30)
        $stocktakeIds = DB::table('stocktakes')->pluck('id')->all();
        $itemIds = DB::table('items')->pluck('id')->all();
        $rows = [];
        for ($i = 0; $i < $this->needed('stocktake_items', 30); $i++) {
            $rows[] = [
                'stocktake_id' => $stocktakeIds[array_rand($stocktakeIds)],
                'item_id' => $itemIds[array_rand($itemIds)],
                'quantity' => rand(10, 500),
                'unit_buying_price' => rand(200, 20000),
                'selling_price' => rand(300, 25000),
                'expiration_date' => Carbon::now()->addMonths(rand(2, 20))->toDateString(),
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('stocktake_items', $rows);
    }

    private function seedMarketingAndOffice()
    {
        $now = $this->now->toDateTimeString();
        $userIds = DB::table('users')->pluck('id')->all();
        $patientIds = DB::table('patients')->pluck('id')->all();
        $adminId = DB::table('users')->where('role', 'Admin')->value('id') ?: 1;
        $insuranceIds = DB::table('insurance_companies')->pluck('id')->all();
        $checkInIds = DB::table('patient_check_ins')->pluck('id')->all();
        $consultationIds = DB::table('consultations')->pluck('id')->all();
        $itemIds = DB::table('items')->pluck('id')->all();
        $paymentCacheItemIds = DB::table('patient_payment_cache_items')->pluck('id')->all();

        // SMS campaigns (30)
        $campaignRows = [];
        for ($i = 0; $i < $this->needed('sms_campaigns', 30); $i++) {
            $status = $this->pick(['draft', 'scheduled', 'sending', 'completed', 'failed']);
            $campaignRows[] = [
                'title' => 'Campaign ' . ($i + 1) . ' - Health Awareness',
                'message' => 'Visit Polyclinic HMS for quality healthcare services.',
                'type' => $this->pick(['offer', 'announcement', 'reminder', 'other']),
                'status' => $status,
                'scheduled_at' => $this->ts2(rand(0, 30)),
                'total_recipients' => rand(10, 200),
                'sent_count' => rand(0, 200),
                'failed_count' => rand(0, 10),
                'recipient_filters' => null,
                'created_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('sms_campaigns', $campaignRows);

        $campaignIds = DB::table('sms_campaigns')->pluck('id')->all();

        // SMS campaign recipients (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('sms_campaign_recipients', 30); $i++) {
            $status = $this->pick(['pending', 'sent', 'failed', 'unreachable']);
            $rows[] = [
                'sms_campaign_id' => $campaignIds[array_rand($campaignIds)],
                'patient_id' => $patientIds[array_rand($patientIds)],
                'phone_number' => $this->pick($this->phoneBase),
                'recipient_name' => $this->pick($this->maleNames) . ' ' . $this->pick($this->lastNames),
                'status' => $status,
                'error_message' => $status === 'failed' ? 'Network error' : null,
                'message_id' => 'MSG' . str_pad($i + 1, 8, '0', STR_PAD_LEFT),
                'api_response' => null,
                'sent_at' => in_array($status, ['sent', 'failed', 'unreachable']) ? $this->ts(rand(0, 30)) : null,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('sms_campaign_recipients', $rows);

        // Marketing strategies (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('marketing_strategies', 30); $i++) {
            $status = $this->pick(['Open', 'Cancelled', 'Closed']);
            $rows[] = [
                'title' => 'Marketing Strategy ' . ($i + 1),
                'overview' => 'Overview of the marketing strategy.',
                'goals' => 'Increase patient visits and awareness.',
                'target_audience' => 'Residents of Dar es Salaam',
                'budget' => 'TZS ' . rand(500000, 20000000),
                'channels' => 'Radio, Social Media, Print',
                'created_by' => $userIds[array_rand($userIds)],
                'status' => $status,
                'cancelled_at' => $status === 'Cancelled' ? $this->ts(rand(0, 30)) : null,
                'cancelled_by' => $status === 'Cancelled' ? $userIds[array_rand($userIds)] : null,
                'closed_at' => $status === 'Closed' ? $this->ts(rand(0, 30)) : null,
                'closed_by' => $status === 'Closed' ? $userIds[array_rand($userIds)] : null,
                'remarks' => null,
                'created_at' => $this->ts(rand(0, 120)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('marketing_strategies', $rows);

        // Communication logs (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('communication_logs', 30); $i++) {
            $rows[] = [
                'customer_name' => $this->pick($this->maleNames) . ' ' . $this->pick($this->lastNames),
                'customer_phone' => $this->pick($this->phoneBase),
                'customer_email' => 'customer' . ($i + 1) . '@example.com',
                'communication_type' => $this->pick(['Phone', 'Chat', 'Email']),
                'communication_direction' => $this->pick(['Incoming', 'Outgoing']),
                'description' => 'Customer communication regarding services.',
                'attachment' => null,
                'created_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('communication_logs', $rows);

        // Messages (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('messages', 30); $i++) {
            $rows[] = [
                'message' => 'Your appointment is confirmed. Thank you for choosing Polyclinic HMS.',
                'phone' => $this->pick($this->phoneBase),
                'patient_id' => $patientIds[array_rand($patientIds)],
                'api_response' => null,
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('messages', $rows);

        // Newsletter subscribers (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('newsletter_subscribers', 30); $i++) {
            $rows[] = [
                'email' => 'subscriber' . ($i + 1) . '@example.com',
                'created_at' => $this->ts(rand(0, 120)),
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('newsletter_subscribers', $rows);

        // Contact submissions (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('contact_submissions', 30); $i++) {
            $rows[] = [
                'first_name' => $this->pick($this->maleNames),
                'last_name' => $this->pick($this->lastNames),
                'email' => 'contact' . ($i + 1) . '@example.com',
                'phone' => $this->pick($this->phoneBase),
                'subject' => 'Enquiry about services',
                'message' => 'I would like to know more about your healthcare services.',
                'created_at' => $this->ts(rand(0, 120)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('contact_submissions', $rows);

        // Ideas (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('ideas', 30); $i++) {
            $status = $this->pick(['Pending', 'Cancelled', 'Implemented']);
            $rows[] = [
                'description' => 'Improvement idea ' . ($i + 1) . ' for hospital operations.',
                'created_by' => $userIds[array_rand($userIds)],
                'status' => $status,
                'cancelled_at' => $status === 'Cancelled' ? $this->ts(rand(0, 30)) : null,
                'cancelled_by' => $status === 'Cancelled' ? $userIds[array_rand($userIds)] : null,
                'implemented_at' => $status === 'Implemented' ? $this->ts(rand(0, 30)) : null,
                'implemented_by' => $status === 'Implemented' ? $userIds[array_rand($userIds)] : null,
                'remarks' => null,
                'created_at' => $this->ts(rand(0, 120)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('ideas', $rows);

        // Events (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('events', 30); $i++) {
            $status = $this->pick(['Pending', 'Cancelled', 'Completed']);
            $rows[] = [
                'event_type' => rand(0, 1) ? 'Appointment' : 'Outreach Programme',
                'event_date' => Carbon::now()->addDays(rand(-20, 30))->toDateString(),
                'title' => 'Event ' . ($i + 1),
                'location' => 'Polyclinic HMS',
                'description' => 'Community health outreach event.',
                'created_by' => $userIds[array_rand($userIds)],
                'status' => $status,
                'cancelled_at' => $status === 'Cancelled' ? $this->ts(rand(0, 30)) : null,
                'cancelled_by' => $status === 'Cancelled' ? $userIds[array_rand($userIds)] : null,
                'completed_at' => $status === 'Completed' ? $this->ts(rand(0, 30)) : null,
                'completed_by' => $status === 'Completed' ? $userIds[array_rand($userIds)] : null,
                'remarks' => null,
                'created_at' => $this->ts(rand(0, 120)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('events', $rows);

        // Office calendar events (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('office_calendar_events', 30); $i++) {
            $start = Carbon::now()->addDays(rand(-20, 30))->addMinutes(rand(0, 600));
            $rows[] = [
                'clinic_id' => 1,
                'title' => 'Meeting ' . ($i + 1),
                'description' => 'Staff meeting.',
                'start_date' => $start->toDateTimeString(),
                'end_date' => $start->copy()->addMinutes(rand(30, 180))->toDateTimeString(),
                'location' => 'Conference Room',
                'color' => $this->pick(['#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0']),
                'event_type' => $this->pick(['Meeting', 'Appointment', 'Deadline', 'Task', 'Reminder', 'Other']),
                'reminder_type' => $this->pick(['None', '15_minutes', '30_minutes', '1_hour', '1_day']),
                'reminder_time' => rand(0, 1) ? $this->ts2(rand(0, 5)) : null,
                'reminder_sent' => rand(0, 1),
                'is_all_day' => rand(0, 4) === 0 ? 1 : 0,
                'is_recurring' => rand(0, 9) === 0 ? 1 : 0,
                'recurring_pattern' => null,
                'recurring_end_date' => null,
                'status' => $this->pick(['Active', 'Cancelled', 'Completed']),
                'created_by' => $userIds[array_rand($userIds)],
                'updated_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('office_calendar_events', $rows);

        // Daily activities (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('daily_activities', 30); $i++) {
            $status = $this->pick(['Pending', 'Cancelled', 'Completed']);
            $rows[] = [
                'activity_date' => Carbon::now()->subDays(rand(0, 60))->toDateString(),
                'description' => 'Daily activity ' . ($i + 1),
                'created_by' => $userIds[array_rand($userIds)],
                'status' => $status,
                'cancelled_at' => $status === 'Cancelled' ? $this->ts(rand(0, 30)) : null,
                'cancelled_by' => $status === 'Cancelled' ? $userIds[array_rand($userIds)] : null,
                'completed_at' => $status === 'Completed' ? $this->ts(rand(0, 30)) : null,
                'completed_by' => $status === 'Completed' ? $userIds[array_rand($userIds)] : null,
                'remarks' => null,
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('daily_activities', $rows);

        // Research plans (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('research_plans', 30); $i++) {
            $status = $this->pick(['Pending', 'Cancelled', 'Completed']);
            $rows[] = [
                'title' => 'Research Plan ' . ($i + 1),
                'overview' => 'Overview of the research plan.',
                'goals' => 'Research goals and objectives.',
                'deliverables' => 'Research deliverables.',
                'target_audience' => 'Target study population.',
                'sample_plan' => 'Sampling strategy.',
                'research_methods' => 'Methods to be used.',
                'timeline' => '12 months',
                'budget' => 'TZS ' . rand(1000000, 30000000),
                'created_by' => $userIds[array_rand($userIds)],
                'status' => $status,
                'cancelled_at' => $status === 'Cancelled' ? $this->ts(rand(0, 30)) : null,
                'cancelled_by' => $status === 'Cancelled' ? $userIds[array_rand($userIds)] : null,
                'completed_at' => $status === 'Completed' ? $this->ts(rand(0, 30)) : null,
                'completed_by' => $status === 'Completed' ? $userIds[array_rand($userIds)] : null,
                'remarks' => null,
                'created_at' => $this->ts(rand(0, 120)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('research_plans', $rows);

        // Insurance claims (30)
        $claimRows = [];
        for ($i = 0; $i < $this->needed('insurance_claims', 30); $i++) {
            $status = $this->pick(['Draft', 'Submitted', 'Approved', 'Rejected', 'Paid']);
            $amount = rand(50000, 2000000);
            $claimRows[] = [
                'claim_no' => 'CLM-' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                'clinic_id' => 1,
                'insurance_company_id' => $insuranceIds[array_rand($insuranceIds)],
                'patient_id' => $patientIds[array_rand($patientIds)],
                'check_in_id' => $checkInIds[array_rand($checkInIds)],
                'consultation_id' => $consultationIds[array_rand($consultationIds)],
                'service_date' => Carbon::now()->subDays(rand(0, 60))->toDateString(),
                'submitted_date' => in_array($status, ['Submitted', 'Approved', 'Rejected', 'Paid']) ? Carbon::now()->subDays(rand(0, 30))->toDateString() : null,
                'status' => $status,
                'claim_amount' => $amount,
                'approved_amount' => in_array($status, ['Approved', 'Paid']) ? $amount : null,
                'paid_amount' => $status === 'Paid' ? $amount : null,
                'reject_reason' => $status === 'Rejected' ? 'Incomplete documentation' : null,
                'created_by' => $userIds[array_rand($userIds)],
                'submitted_by' => in_array($status, ['Submitted', 'Approved', 'Rejected', 'Paid']) ? $userIds[array_rand($userIds)] : null,
                'approved_by' => in_array($status, ['Approved', 'Paid']) ? $userIds[array_rand($userIds)] : null,
                'paid_by' => $status === 'Paid' ? $userIds[array_rand($userIds)] : null,
                'submitted_at' => in_array($status, ['Submitted', 'Approved', 'Rejected', 'Paid']) ? $this->ts(rand(0, 30)) : null,
                'approved_at' => in_array($status, ['Approved', 'Paid']) ? $this->ts(rand(0, 30)) : null,
                'paid_at' => $status === 'Paid' ? $this->ts(rand(0, 30)) : null,
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertUnique('insurance_claims', $claimRows);

        $claimIds = DB::table('insurance_claims')->pluck('id')->all();

        // Insurance claim items (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('insurance_claim_items', 30); $i++) {
            $qty = rand(1, 5);
            $price = rand(1000, 100000);
            $rows[] = [
                'insurance_claim_id' => $claimIds[array_rand($claimIds)],
                'payment_cache_item_id' => $paymentCacheItemIds[array_rand($paymentCacheItemIds)],
                'item_id' => $itemIds[array_rand($itemIds)],
                'item_name' => DB::table('items')->inRandomOrder()->value('name'),
                'quantity' => $qty,
                'unit_price' => $price,
                'amount' => $qty * $price,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('insurance_claim_items', $rows);
    }

    private function seedFinanceAndPerformance()
    {
        $now = $this->now->toDateTimeString();
        $userIds = DB::table('users')->pluck('id')->all();
        $adminId = DB::table('users')->where('role', 'Admin')->value('id') ?: 1;
        $clinicIds = DB::table('clinics')->pluck('id')->all();
        $expenseCategoryIds = DB::table('expense_categories')->pluck('id')->all();

        // Expenses (30 total)
        $expenseRows = [];
        $existing = $this->countOf('expenses');
        for ($i = $existing; $i < 30; $i++) {
            $amount = rand(50000, 3000000);
            $expenseRows[] = [
                'category_id' => $expenseCategoryIds[array_rand($expenseCategoryIds)],
                'total_amount' => $amount,
                'description' => 'Expense item ' . ($i + 1),
                'running_cost' => rand(0, 1),
                'improvement_cost' => rand(0, 1),
                'expense_date' => Carbon::now()->subDays(rand(0, 90))->toDateString(),
                'created_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('expenses', $expenseRows);

        $expenseIds = DB::table('expenses')->pluck('id')->all();

        // Expense payments (30 total)
        $rows = [];
        $existing = $this->countOf('expense_payments');
        for ($i = $existing; $i < 30; $i++) {
            $rows[] = [
                'expense_id' => $expenseIds[array_rand($expenseIds)],
                'amount' => rand(10000, 1000000),
                'description' => 'Payment for expense',
                'created_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 90)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('expense_payments', $rows);

        // Department reports (30)
        $departmentNames = ['Laboratory', 'Radiology', 'Pharmacy', 'Outpatient', 'Inpatient', 'Marketing', 'Finance', 'Nursing'];
        $rows = [];
        for ($i = 0; $i < $this->needed('department_reports', 30); $i++) {
            $rows[] = [
                'department' => $departmentNames[$i % count($departmentNames)],
                'date' => Carbon::now()->subDays(rand(0, 60))->toDateString(),
                'remarks' => 'Department performance report.',
                'recommendations' => 'Continue improving service delivery.',
                'updated_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('department_reports', $rows);

        // Department performance reports (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('department_performance_reports', 30); $i++) {
            $rows[] = [
                'department' => $departmentNames[$i % count($departmentNames)],
                'report_name' => 'Performance Report ' . ($i + 1),
                'report_date' => Carbon::now()->subDays(rand(0, 60))->toDateString(),
                'kpi_data' => json_encode(['patients' => rand(50, 300), 'satisfaction' => rand(70, 100)]),
                'summary' => 'Summary of departmental performance.',
                'recommendations' => 'Improvements recommended.',
                'status' => $this->pick(['Active', 'Archived']),
                'clinic_id' => 1,
                'created_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('department_performance_reports', $rows);

        // Department KPI targets (30) - unique (department, kpi_name, clinic_id)
        $rows = [];
        $kpiNames = ['Patient Satisfaction', 'Average Wait Time', 'Bed Occupancy', 'Lab Turnaround', 'No. of Visits', 'Revenue Target'];
        $existingCombos = DB::table('department_kpi_targets')
            ->where('clinic_id', 1)
            ->select('department', 'kpi_name')
            ->get()
            ->map(function ($r) {
                return $r->department . '|' . $r->kpi_name;
            })
            ->flip()
            ->all();
        $candidates = [];
        foreach ($departmentNames as $department) {
            foreach ($kpiNames as $kpiName) {
                $candidates[] = $department . '|' . $kpiName;
            }
        }
        shuffle($candidates);
        $count = 0;
        $need = $this->needed('department_kpi_targets', 30);
        foreach ($candidates as $combo) {
            if ($count >= $need) {
                break;
            }
            if (isset($existingCombos[$combo])) {
                continue;
            }
            $existingCombos[$combo] = true;
            $count++;
            [$department, $kpiName] = explode('|', $combo);
            $rows[] = [
                'department' => $department,
                'kpi_name' => $kpiName,
                'target_value' => rand(50, 500),
                'target_unit' => $this->pick(['%', 'minutes', 'count', 'TZS']),
                'status' => 'Active',
                'clinic_id' => 1,
                'created_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('department_kpi_targets', $rows);

        // Department performance access (30) - unique (department, user, clinic)
        $rows = [];
        $count = 0;
        $i = 0;
        while ($count < $this->needed('department_performance_access', 30)) {
            $department = $departmentNames[$i % count($departmentNames)];
            $userId = $userIds[$i % count($userIds)];
            $clinicId = 1;
            $rows[] = [
                'department' => $department,
                'user_id' => $userId,
                'clinic_id' => $clinicId,
                'access_level' => $this->pick(['View', 'Edit']),
                'granted_by' => $adminId,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
            $count++;
            $i++;
        }
        $this->insertRows('department_performance_access', $rows);

        // Department performance audit logs (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('department_performance_audit_logs', 30); $i++) {
            $rows[] = [
                'department' => $departmentNames[$i % count($departmentNames)],
                'action' => $this->pick(['create', 'update', 'delete', 'view']),
                'old_values' => json_encode(['target' => rand(1, 100)]),
                'new_values' => json_encode(['target' => rand(1, 100)]),
                'notes' => 'Audit log entry.',
                'user_id' => $userIds[$i % count($userIds)],
                'clinic_id' => 1,
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('department_performance_audit_logs', $rows);

        // Employee reports (30)
        $rows = [];
        for ($i = 0; $i < $this->needed('employee_reports', 30); $i++) {
            $rows[] = [
                'clinic_id' => 1,
                'employee_id' => $userIds[$i % count($userIds)],
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('employee_reports', $rows);

        // Performance targets (30) - unique (department, kpi_id, clinic_id)
        $rows = [];
        $existingPerfTargets = DB::table('performance_targets')
            ->where('clinic_id', 1)
            ->select('department', 'kpi_id')
            ->get()
            ->map(function ($r) {
                return $r->department . '|' . $r->kpi_id;
            })
            ->flip()
            ->all();
        $candidates = [];
        foreach ($departmentNames as $department) {
            for ($k = 1; $k <= 12; $k++) {
                $candidates[] = $department . '|KPI-' . $k;
            }
        }
        shuffle($candidates);
        $count = 0;
        $need = $this->needed('performance_targets', 30);
        foreach ($candidates as $combo) {
            if ($count >= $need) {
                break;
            }
            if (isset($existingPerfTargets[$combo])) {
                continue;
            }
            $existingPerfTargets[$combo] = true;
            $count++;
            [$department, $kpiId] = explode('|', $combo);
            $rows[] = [
                'department' => $department,
                'kpi_id' => $kpiId,
                'target' => rand(50, 500),
                'clinic_id' => 1,
                'created_by' => $userIds[array_rand($userIds)],
                'updated_by' => $userIds[array_rand($userIds)],
                'created_at' => $this->ts(rand(0, 60)),
                'updated_at' => $now,
            ];
        }
        $this->insertRows('performance_targets', $rows);
    }
}
