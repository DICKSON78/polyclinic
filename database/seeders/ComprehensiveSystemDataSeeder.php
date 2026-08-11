<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ComprehensiveSystemDataSeeder extends Seeder
{
    /**
     * Run comprehensive database seeds for all system charts and cards.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding comprehensive system data for all charts and cards...');
        
        // Create basic data first
        $this->createInformationSources();
        
        // Create sample patients
        $this->createPatients();
        
        // Create sample items with proper categories
        $this->createItems();
        
        // Create sample sales data
        $this->createSalesData();
        
        // Create sample expenses
        $this->createExpenses();
        
        // Create sample check-ins and consultations
        $this->createCheckInsAndConsultations();
        
        // Create sample stocktakes
        $this->createStocktakes();
        
        $this->command->info('✅ Comprehensive system data seeded successfully!');
        $this->command->info('📊 All charts and cards will now show realistic data!');
    }
    
    private function createInformationSources()
    {
        $this->command->info('📋 Creating information sources...');
        
        $sources = ['Facebook', 'Instagram', 'Referral', 'Walk-in', 'Website'];
        
        foreach ($sources as $index => $source) {
            DB::table('information_sources')->insert([
                'name' => $source,
                'status' => 'Active',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
    
    private function createPatients()
    {
        $this->command->info('👥 Creating sample patients...');
        
        for ($i = 1; $i <= 50; $i++) {
            DB::table('patients')->insert([
                'first_name' => "Patient {$i}",
                'last_name' => "Sample",
                'middle_name' => chr(65 + ($i % 26)),
                'phone' => "255" . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT),
                'email' => "patient{$i}@polyclinic-hms.com",
                'gender' => $i % 2 === 0 ? 'Male' : 'Female',
                'date_of_birth' => Carbon::now()->subYears(rand(18, 70))->subDays(rand(1, 365)),
                'national_id' => str_pad($i, 10, '0', STR_PAD_LEFT),
                'region_id' => rand(1, 25),
                'district_id' => rand(1, 150),
                'info_source_id' => rand(1, 5),
                'created_by' => 1,
                'created_at' => Carbon::now()->subDays(rand(1, 90)),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
    
    private function createItems()
    {
        $this->command->info('📦 Creating sample items...');
        
        // Get existing types
        $frameType = DB::table('item_types')->where('name', 'Frame')->first();
        $pharmaType = DB::table('item_types')->where('name', 'Pharmaceutical')->first();
        $lensType = DB::table('item_types')->where('name', 'Lens')->first();
        
        $glassType = DB::table('consultation_types')->where('name', 'Glass')->first();
        $pharmacyType = DB::table('consultation_types')->where('name', 'Pharmacy')->first();
        
        // Create frames
        $frames = [
            ['Ray-Ban Aviator Classic', 250000, 45, 15],
            ['Oakley Holbrook Polarized', 180000, 38, 12],
            ['Tom Ford FT5282', 320000, 22, 8],
            ['Gucci GG0061S', 450000, 18, 6],
            ['Prada PR 16WV', 380000, 25, 10],
            ['Versace VE4361', 420000, 15, 5],
            ['Dior DIORHOMME', 280000, 30, 12],
            ['Burberry BE4291', 350000, 20, 7],
        ];
        
        // Create medicines
        $medicines = [
            ['Paracetamol 500mg', 5000, 200, 50],
            ['Amoxicillin 500mg', 8500, 150, 30],
            ['Ibuprofen 400mg', 6500, 180, 40],
            ['Ciprofloxacin 500mg', 12000, 120, 25],
            ['Azithromycin 250mg', 15000, 100, 20],
            ['Metformin 500mg', 9500, 160, 35],
            ['Lisinopril 10mg', 11000, 140, 28],
            ['Simvastatin 20mg', 13500, 110, 22],
        ];
        
        // Create lenses
        $lenses = [
            ['Single Vision -1.00', 8000, 80, 20],
            ['Single Vision -2.00', 8500, 75, 18],
            ['Single Vision -3.00', 9000, 70, 15],
            ['Bifocal D28', 25000, 40, 10],
            ['Progressive 1.50', 35000, 30, 8],
            ['Anti-Glare Coating', 5000, 100, 25],
        ];
        
        // Insert frames
        foreach ($frames as $frame) {
            DB::table('items')->insert([
                'name' => $frame[0],
                'item_type_id' => $frameType->id ?? 1,
                'consultation_type_id' => $glassType->id ?? 1,
                'unit_price' => $frame[1],
                'balance' => $frame[2],
                'minimum_stock' => $frame[3],
                'is_stock_item' => 'Yes',
                'status' => 'Active',
                'created_at' => Carbon::now()->subDays(rand(1, 60)),
                'updated_at' => Carbon::now(),
            ]);
        }
        
        // Insert medicines
        foreach ($medicines as $medicine) {
            DB::table('items')->insert([
                'name' => $medicine[0],
                'item_type_id' => $pharmaType->id ?? 2,
                'consultation_type_id' => $pharmacyType->id ?? 2,
                'unit_price' => $medicine[1],
                'balance' => $medicine[2],
                'minimum_stock' => $medicine[3],
                'is_stock_item' => 'Yes',
                'has_expiry' => 'Yes',
                'expiry_date' => Carbon::now()->addMonths(rand(6, 24)),
                'status' => 'Active',
                'created_at' => Carbon::now()->subDays(rand(1, 60)),
                'updated_at' => Carbon::now(),
            ]);
        }
        
        // Insert lenses
        foreach ($lenses as $lens) {
            DB::table('items')->insert([
                'name' => $lens[0],
                'item_type_id' => $lensType->id ?? 3,
                'consultation_type_id' => $glassType->id ?? 1,
                'unit_price' => $lens[1],
                'balance' => $lens[2],
                'minimum_stock' => $lens[3],
                'is_stock_item' => 'Yes',
                'status' => 'Active',
                'created_at' => Carbon::now()->subDays(rand(1, 60)),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
    
    private function createSalesData()
    {
        $this->command->info('💰 Creating sample sales data...');
        
        $patients = DB::table('patients')->pluck('id')->toArray();
        $items = DB::table('items')->pluck('id', 'name')->toArray();
        
        if (empty($patients) || empty($items)) {
            $this->command->warn('No patients or items found');
            return;
        }
        
        // Create check-ins first
        foreach (range(1, 100) as $index) {
            $checkInDate = Carbon::now()->subDays(rand(1, 90));
            $patientId = $patients[array_rand($patients)];
            
            $checkInId = DB::table('check_ins')->insertGetId([
                'patient_id' => $patientId,
                'check_in_type' => 'Regular',
                'status' => 'Completed',
                'created_by' => 1,
                'created_at' => $checkInDate,
                'updated_at' => $checkInDate,
            ]);
            
            // Create payment cache for this check-in
            $paymentCacheId = DB::table('patient_payment_cache')->insertGetId([
                'check_in_id' => $checkInId,
                'created_by' => 1,
                'created_at' => $checkInDate,
                'updated_at' => $checkInDate,
            ]);
            
            // Add 1-5 items per transaction
            $itemCount = rand(1, 5);
            for ($i = 0; $i < $itemCount; $i++) {
                $itemName = array_rand($items);
                $itemId = $items[$itemName];
                $quantity = rand(1, 3);
                $price = rand(5000, 500000);
                
                DB::table('patient_payment_cache_items')->insert([
                    'payment_cache_id' => $paymentCacheId,
                    'item_id' => $itemId,
                    'consultation_type_id' => $this->getConsultationTypeForItem($itemName),
                    'payment_mode_id' => 1, // Cash
                    'unit_price' => $price,
                    'quantity' => $quantity,
                    'discount' => rand(0, 10) * 1000,
                    'status' => 'Served',
                    'served_at' => $checkInDate->copy()->addHours(rand(1, 4)),
                    'served_by' => 1,
                    'created_at' => $checkInDate,
                    'updated_at' => $checkInDate,
                ]);
            }
        }
    }
    
    private function createExpenses()
    {
        $this->command->info('💸 Creating sample expenses...');
        
        $categories = DB::table('expense_categories')->pluck('id', 'name')->toArray();
        
        if (empty($categories)) {
            $this->command->warn('No expense categories found');
            return;
        }
        
        // Create expenses for last 90 days
        foreach (range(1, 90) as $day) {
            $date = Carbon::now()->subDays($day);
            $dailyExpenses = rand(1, 4);
            
            for ($i = 1; $i <= $dailyExpenses; $i++) {
                $categoryName = array_rand($categories);
                $categoryId = $categories[$categoryName];
                
                $expenseId = DB::table('expenses')->insertGetId([
                    'expense_category_id' => $categoryId,
                    'amount' => rand(50000, 1000000),
                    'description' => "Sample {$categoryName} expense",
                    'created_by' => 1,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
                
                DB::table('expense_payments')->insert([
                    'expense_id' => $expenseId,
                    'amount' => rand(50000, 1000000),
                    'payment_method' => 'Cash',
                    'created_by' => 1,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
            }
        }
    }
    
    private function createCheckInsAndConsultations()
    {
        $this->command->info('🏥 Creating sample consultations...');
        
        $patients = DB::table('patients')->limit(30)->pluck('id')->toArray();
        $users = DB::table('users')->limit(5)->pluck('id')->toArray();
        
        foreach (range(1, 50) as $index) {
            $date = Carbon::now()->subDays(rand(1, 60));
            $patientId = $patients[array_rand($patients)];
            $userId = $users[array_rand($users)];
            
            $checkInId = DB::table('check_ins')->insertGetId([
                'patient_id' => $patientId,
                'check_in_type' => 'Regular',
                'status' => 'Completed',
                'created_by' => $userId,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
            
            // Create consultation
            DB::table('consultations')->insert([
                'check_in_id' => $checkInId,
                'consultation_type_id' => rand(1, 4),
                'consultant_id' => $userId,
                'status' => 'Completed',
                'notes' => 'Sample consultation notes',
                'created_by' => $userId,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }
    
    private function createStocktakes()
    {
        $this->command->info('📊 Creating sample stocktakes...');
        
        $items = DB::table('items')->where('is_stock_item', 'Yes')->limit(20)->pluck('id')->toArray();
        
        foreach (range(1, 10) as $index) {
            $date = Carbon::now()->subDays(rand(1, 30));
            $itemId = $items[array_rand($items)];
            
            $stocktakeId = DB::table('stocktakes')->insertGetId([
                'reference_number' => 'ST-' . str_pad($index, 6, '0', STR_PAD_LEFT),
                'status' => 'Completed',
                'notes' => 'Sample stocktake',
                'created_by' => 1,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
            
            DB::table('stocktake_items')->insert([
                'stocktake_id' => $stocktakeId,
                'item_id' => $itemId,
                'quantity' => rand(10, 100),
                'unit_buying_price' => rand(5000, 50000),
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }
    
    private function getConsultationTypeForItem($itemName)
    {
        if (strpos($itemName, 'mg') !== false || strpos($itemName, 'Paracetamol') !== false) {
            return 2; // Pharmacy
        }
        return 1; // Glass
    }
}
