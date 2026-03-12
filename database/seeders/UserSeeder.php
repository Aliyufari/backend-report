<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role as RoleModel;
use App\Enums\Role as RoleType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $role = RoleModel::where('name', RoleType::SUPER_ADMIN->value)
            ->firstOrFail();

        User::firstOrCreate(
            ['email' => 'af@email.com'],
            [
                'name' => 'AF',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role_id' => $role->id,
            ]
        );
    }
}
