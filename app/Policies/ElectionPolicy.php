<?php

namespace App\Policies;

use App\Enums\Role as RoleEnum;
use App\Models\Election;
use App\Models\User;

class ElectionPolicy
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

    public function view(User $user, Election $election): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value]);
    }

    public function update(User $user, Election $election): bool
    {
        return $user->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value]);
    }

    public function delete(User $user, Election $election): bool
    {
        return $user->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value]);
    }
}