<?php

namespace App\Policies;

use App\Enums\Role as RoleEnum;
use App\Models\Result;
use App\Models\User;

class ResultPolicy
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

    public function view(User $user, Result $result): bool
    {
        return $this->withinJurisdiction($user, $result);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value]);
    }

    public function update(User $user, Result $result): bool
    {
        if (! $user->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value])) {
            return false;
        }

        return $this->withinJurisdiction($user, $result);
    }

    public function delete(User $user, Result $result): bool
    {
        return $user->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value]);
    }

    protected function withinJurisdiction(User $user, Result $result): bool
    {
        return $result->pu ? $result->pu->isWithinJurisdictionOf($user) : false;
    }
}