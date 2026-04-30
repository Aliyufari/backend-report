<?php

namespace Database\Seeders;

use App\Enums\Role as RoleEnum;
use App\Enums\Permission as PermissionEnum;
use App\Models\Role as RoleModel;
use App\Models\Permission as PermissionModel;
use Illuminate\Database\Seeder;

class RbacSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cache (IMPORTANT)
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Create permissions
        foreach (PermissionEnum::cases() as $permission) {
            PermissionModel::firstOrCreate([
                'name' => $permission->value
            ]);
        }

        // 2. Create roles
        foreach (RoleEnum::cases() as $role) {
            RoleModel::firstOrCreate([
                'name' => $role->value
            ]);
        }

        // 3. Assign permissions

        // SUPER ADMIN → everything
        RoleModel::findByName(RoleEnum::SUPER_ADMIN->value)
            ->givePermissionTo(PermissionModel::all());

        // ADMIN → system-wide management
        RoleModel::findByName(RoleEnum::ADMIN->value)
            ->givePermissionTo([
                PermissionEnum::USER_VIEW->value,
                PermissionEnum::USER_EDIT->value,
                PermissionEnum::USER_DELETE->value,

                PermissionEnum::STATE_VIEW->value,
                PermissionEnum::STATE_EDIT->value,

                PermissionEnum::ZONE_VIEW->value,
                PermissionEnum::ZONE_EDIT->value,

                PermissionEnum::LGA_VIEW->value,
                PermissionEnum::LGA_EDIT->value,

                PermissionEnum::WARD_VIEW->value,
                PermissionEnum::WARD_EDIT->value,

                PermissionEnum::CVR_VIEW->value,
            ]);

        // STATE COORDINATOR (limited domain)
        RoleModel::findByName(RoleEnum::STATE_COORDINATOR->value)
            ->givePermissionTo([
                PermissionEnum::CVR_VIEW->value,
                PermissionEnum::CVR_CREATE->value,
                PermissionEnum::CVR_EDIT->value,
            ]);

        // ZONAL COORDINATOR
        RoleModel::findByName(RoleEnum::ZONAL_COORDINATOR->value)
            ->givePermissionTo([
                PermissionEnum::CVR_VIEW->value,
                PermissionEnum::CVR_EDIT->value,
            ]);

        // LGA / WARD similar pattern...
    }
}
