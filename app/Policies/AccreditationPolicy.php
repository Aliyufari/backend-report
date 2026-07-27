<?php

namespace App\Policies;

use App\Enums\Role as RoleEnum;
use App\Models\Accreditation;
use App\Models\User;

class AccreditationPolicy
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

    public function view(User $user, Accreditation $accreditation): bool
    {
        return $this->withinJurisdiction($user, $accreditation);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value]);
    }

    public function update(User $user, Accreditation $accreditation): bool
    {
        if (! $user->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value])) {
            return false;
        }

        return $this->withinJurisdiction($user, $accreditation);
    }

    public function delete(User $user, Accreditation $accreditation): bool
    {
        return $user->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value]);
    }

    protected function withinJurisdiction(User $user, Accreditation $accreditation): bool
    {
        return $accreditation->pu ? $accreditation->pu->isWithinJurisdictionOf($user) : false;
    }
}