<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\Clinic;
use App\Models\UserPrivilege;

class CreateTechUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if tech user exists
        $techUser = User::where('username', 'tech')->first();
        
        if ($techUser) {
            // Update existing tech user to ensure it has admin credentials
            $techUser->update([
                'password' => Hash::make('tech'),
                'role' => 'Admin',
                'status' => 'Active',
                'updated_at' => now(),
            ]);
            
            $this->command->info('Tech user found and updated:');
            $this->command->info('Username: tech');
            $this->command->info('Password: tech');
            $this->command->info('Role: Admin');
            $this->command->info('Status: Active');
        } else {
            // Get the first clinic or create a default one
            $clinic = Clinic::first();
            if (!$clinic) {
                $clinic = Clinic::create([
                    'name' => 'Default Clinic',
                    'phone' => '0000000000',
                    'email' => 'clinic@polyclinic-hms.com',
                    'address' => 'Default Address',
                ]);
            }
            
            // Create new tech user with admin credentials
            $techUser = User::create([
                'clinic_id' => $clinic->id,
                'first_name' => 'Tech',
                'last_name' => 'Admin',
                'username' => 'tech',
                'password' => Hash::make('tech'),
                'role' => 'Admin',
                'status' => 'Active',
                'email' => 'tech@polyclinic-hms.com',
                'phone' => '0000000000',
                'gender' => 'Male',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            $this->command->info('Tech user created:');
            $this->command->info('Username: tech');
            $this->command->info('Password: tech');
            $this->command->info('Role: Admin');
            $this->command->info('Status: Active');
        }
        
        // Assign all admin privileges to tech user
        $this->assignAllPrivileges($techUser);
    }
    
    /**
     * Assign all system privileges to the tech user
     */
    private function assignAllPrivileges(User $user): void
    {
        // Check if user_privileges table has 'privilege' column (new structure) or individual columns (old structure)
        $hasPrivilegeColumn = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'user_privileges' 
            AND COLUMN_NAME = 'privilege'
        ");
        
        if ($hasPrivilegeColumn && $hasPrivilegeColumn->count > 0) {
            // New structure: privilege column exists
            $allPrivileges = [
                'dashboard',
                'reception',
                'medicine_center',
                'optician_center',
                'consultation_room',
                'procedure_room',
                'other_dispensing',
                'dispensing',
                'marketing',
                'financial_management',
                'payment_center',
                'inventory_management',
                'user_management',
                'settings',
                'patient_management',
                'doctor_management',
                'nurse_management',
                'staff_management',
                'clinic_management',
                'report_management',
                'backup_management',
                'system_administration',
                'data_export',
                'data_import',
                'audit_logs',
                'notification_management',
                'communication_management',
                'research_management',
                'marketing_management',
                'financial_reports',
                'patient_reports',
                'inventory_reports',
                'staff_reports',
                'system_reports',
                'emergency_access',
                'maintenance_mode',
                'database_management',
                'file_management',
                'security_management',
                'compliance_management',
                'quality_assurance',
                'training_management',
                'director',
                'office_calendar',
                'calendar_edit',
                'sales_center',
                'receptionist_monthly_report',
                'cashier_monthly_report',
                'optometrist_monthly_report',
                'sales_manager_monthly_report',
                'marketing_operations_monthly_report',
            ];
            
            // Clear existing privileges and add all privileges
            UserPrivilege::where('user_id', $user->id)->delete();
            
            foreach ($allPrivileges as $privilege) {
                UserPrivilege::create([
                    'user_id' => $user->id,
                    'privilege' => $privilege
                ]);
            }
            
            $this->command->info("✅ Assigned " . count($allPrivileges) . " privileges to tech user");
        } else {
            // Old structure: individual boolean columns
            // Get all columns from user_privileges table (except user_id)
            $columns = DB::select("
                SELECT COLUMN_NAME 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'user_privileges' 
                AND COLUMN_NAME != 'user_id'
            ");
            
            // Build update data with all privileges set to 1
            $updateData = ['user_id' => $user->id];
            foreach ($columns as $column) {
                $updateData[$column->COLUMN_NAME] = 1;
            }
            
            // Use updateOrInsert to create or update the privileges
            DB::table('user_privileges')->updateOrInsert(
                ['user_id' => $user->id],
                $updateData
            );
            
            $this->command->info("✅ Assigned all " . count($columns) . " privileges to tech user (old structure)");
        }
    }
}
