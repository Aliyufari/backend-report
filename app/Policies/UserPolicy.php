<?php

namespace App\Policies;

use App\Enums\Role as RoleEnum;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $authUser): bool
    {
        return $authUser->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
            RoleEnum::GOVERNOR->value,
            RoleEnum::STATE_COORDINATOR->value,
            RoleEnum::ZONAL_COORDINATOR->value,
            RoleEnum::LGA_COORDINATOR->value,
            RoleEnum::WARD_COORDINATOR->value,
        ]);
    }

    public function view(User $authUser, User $user): bool
    {
        return $authUser->canAccessUser($user);
    }

    public function create(User $authUser): bool
    {
        return $authUser->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
            RoleEnum::GOVERNOR->value,
            RoleEnum::STATE_COORDINATOR->value,
            RoleEnum::ZONAL_COORDINATOR->value,
            RoleEnum::LGA_COORDINATOR->value,
        ]);
    }

    public function update(User $authUser, User $user): bool
    {
        return $authUser->canManageUser($user, 'update');
    }

    public function delete(User $authUser, User $user): bool
    {
        return $authUser->canManageUser($user, 'delete');
    }
}