<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Department;
use App\Models\JobTitle;
use App\Models\Clinic;

class CreateTestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test user with known credentials
        $user = User::updateOrCreate(
            ['username' => 'admin'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'role' => 'Admin',
                'status' => 'Active',
                'email' => 'admin@polyclinic-hms.com',
                'phone' => '1234567890',
                'gender' => 'Male',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $this->command->info('Test user created:');
        $this->command->info('Username: admin');
        $this->command->info('Password: password');
        $this->command->info('Status: Active');
    }
}
