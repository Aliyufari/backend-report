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
            ['email' => 'aliyufari@gmail.com'],
            [
                'name' => 'AF',
                'password' => Hash::make('Fari@3031.'),
                'email_verified_at' => now(),
                'role_id' => $role->id,
            ]
        );

        User::firstOrCreate(
            ['email' => 'aslere00005@gmail.com'],
            [
                'name' => 'A S Lere',
                'password' => Hash::make('Aslere00005'),
                'email_verified_at' => now(),
                'role_id' => $role->id,
            ]
        );
    }
}
