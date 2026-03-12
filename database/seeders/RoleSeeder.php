<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role as RoleModel;
use App\Enums\Role as RoleType;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (RoleType::cases() as $role) {
            RoleModel::updateOrCreate(
                ['name' => $role->value],
                [
                    'name' => $role->value,
                ]
            );
        }
    }
}
