<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Pu;
use App\Models\User;

class PuPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
            Role::GOVERNOR->value,
            Role::STATE_COORDINATOR->value,
            Role::ZONAL_COORDINATOR->value,
            Role::LGA_COORDINATOR->value,
            Role::WARD_COORDINATOR->value,
        ]);
    }

    public function view(User $user, Pu $pu): bool
    {
        if ($user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
            Role::GOVERNOR->value,
        ])) {
            return true;
        }

        if ($user->hasRole(Role::STATE_COORDINATOR->value)) {
            return $pu->ward?->lga?->zone?->state_id === $user->location_id;
        }

        if ($user->hasRole(Role::ZONAL_COORDINATOR->value)) {
            return $pu->ward?->lga?->zone_id === $user->location_id;
        }

        if ($user->hasRole(Role::LGA_COORDINATOR->value)) {
            return $pu->ward?->lga_id === $user->location_id;
        }

        if ($user->hasRole(Role::WARD_COORDINATOR->value)) {
            return $pu->ward_id === $user->location_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ]);
    }

    public function update(User $user, Pu $pu): bool
    {
        return $user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ]);
    }

    public function delete(User $user, Pu $pu): bool
    {
        return $user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ]);
    }

    public function restore(User $user, Pu $pu): bool
    {
        return $user->hasRole(Role::SUPER_ADMIN->value);
    }

    public function forceDelete(User $user, Pu $pu): bool
    {
        return $user->hasRole(Role::SUPER_ADMIN->value);
    }
}