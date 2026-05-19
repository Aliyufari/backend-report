<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\State;
use App\Models\User;

class StatePolicy
{
    /**
     * super_admin, admin, governor, and all coordinators can view the states list
     * (needed for dropdowns and location context throughout the app).
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
     * Same as viewAny — any authenticated role can view a single state.
     */
    public function view(User $user, State $state): bool
    {
        return $this->viewAny($user);
    }

    /**
     * Only super_admin and admin can create states.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ]);
    }

    /**
     * Only super_admin and admin can update states.
     */
    public function update(User $user, State $state): bool
    {
        return $user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ]);
    }

    /**
     * Only super_admin and admin can delete states.
     */
    public function delete(User $user, State $state): bool
    {
        return $user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ]);
    }

    public function restore(User $user, State $state): bool
    {
        return $user->hasRole(Role::SUPER_ADMIN->value);
    }

    public function forceDelete(User $user, State $state): bool
    {
        return $user->hasRole(Role::SUPER_ADMIN->value);
    }
}