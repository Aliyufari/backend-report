<?php

namespace App\Policies;

use App\Enums\Role as RoleEnum;
use App\Models\Bivas;
use App\Models\User;

class BivasPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
            RoleEnum::GOVERNOR->value,
            RoleEnum::STATE_COORDINATOR->value,
            RoleEnum::ZONAL_COORDINATOR->value,
            RoleEnum::LGA_COORDINATOR->value,
            RoleEnum::WARD_COORDINATOR->value,
        ]);
    }

    public function view(User $user, Bivas $bivas): bool
    {
        return $this->withinJurisdiction($user, $bivas);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
        ]);
    }

    public function update(User $user, Bivas $bivas): bool
    {
        if (! $user->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value])) {
            return false;
        }

        return $this->withinJurisdiction($user, $bivas);
    }

    public function delete(User $user, Bivas $bivas): bool
    {
        return $user->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
        ]);
    }

    public function restore(User $user, Bivas $bivas): bool
    {
        return $user->hasRole(RoleEnum::SUPER_ADMIN->value);
    }

    public function forceDelete(User $user, Bivas $bivas): bool
    {
        return $user->hasRole(RoleEnum::SUPER_ADMIN->value);
    }

    protected function withinJurisdiction(User $user, Bivas $bivas): bool
    {
        return $bivas->pu ? $bivas->pu->isWithinJurisdictionOf($user) : false;
    }
}