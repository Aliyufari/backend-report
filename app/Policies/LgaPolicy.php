<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Lga;
use App\Models\User;

class LgaPolicy
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

    public function view(User $user, Lga $lga): bool
    {
        if ($user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
            Role::GOVERNOR->value,
        ])) {
            return true;
        }

        if ($user->hasRole(Role::STATE_COORDINATOR->value)) {
            return $lga->zone?->state_id === $user->location_id;
        }

        if ($user->hasRole(Role::ZONAL_COORDINATOR->value)) {
            return $lga->zone_id === $user->location_id;
        }

        if ($user->hasRole(Role::LGA_COORDINATOR->value)) {
            return $lga->id === $user->location_id;
        }

        if ($user->hasRole(Role::WARD_COORDINATOR->value)) {
            return $lga->id === optional($user->location->lga)->id;
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

    public function update(User $user, Lga $lga): bool
    {
        return $user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ]);
    }

    public function delete(User $user, Lga $lga): bool
    {
        return $user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ]);
    }

    public function restore(User $user, Lga $lga): bool
    {
        return $user->hasRole(Role::SUPER_ADMIN->value);
    }

    public function forceDelete(User $user, Lga $lga): bool
    {
        return $user->hasRole(Role::SUPER_ADMIN->value);
    }
}