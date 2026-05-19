<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\User;
use App\Models\Zone;

class ZonePolicy
{
    /**
     * super_admin, admin, governor, and state coordinators can view zones.
     * Zonal coordinators and below can also view (needed for context/dropdowns).
     */
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

    /**
     * A coordinator can only view a zone within their jurisdiction.
     * Admins and governor can view any.
     */
    public function view(User $user, Zone $zone): bool
    {
        if ($user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
            Role::GOVERNOR->value,
        ])) {
            return true;
        }

        // State coordinator — zone must belong to their state
        if ($user->hasRole(Role::STATE_COORDINATOR->value)) {
            return $zone->state_id === $user->location_id;
        }

        // Zonal coordinator — must be their own zone
        if ($user->hasRole(Role::ZONAL_COORDINATOR->value)) {
            return $zone->id === $user->location_id;
        }

        // LGA/Ward coordinators — zone must be ancestor of their location
        if ($user->hasRole(Role::LGA_COORDINATOR->value)) {
            return $zone->id === optional($user->location->zone)->id;
        }

        if ($user->hasRole(Role::WARD_COORDINATOR->value)) {
            return $zone->id === optional($user->location->lga?->zone)->id;
        }

        return false;
    }

    /**
     * Only super_admin and admin can create zones.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ]);
    }

    /**
     * Only super_admin and admin can update zones.
     */
    public function update(User $user, Zone $zone): bool
    {
        return $user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ]);
    }

    /**
     * Only super_admin and admin can delete zones.
     */
    public function delete(User $user, Zone $zone): bool
    {
        return $user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ]);
    }

    public function restore(User $user, Zone $zone): bool
    {
        return $user->hasRole(Role::SUPER_ADMIN->value);
    }

    public function forceDelete(User $user, Zone $zone): bool
    {
        return $user->hasRole(Role::SUPER_ADMIN->value);
    }
}