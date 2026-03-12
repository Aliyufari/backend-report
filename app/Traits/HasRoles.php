<?php

namespace App\Traits;

use App\Enums\Role as RoleType;
use App\Models\Role as RoleModel;

trait HasRoles
{
    /**
     * Get the user's role as enum.
     */
    public function roleEnum(): ?RoleType
    {
        return RoleType::tryFrom($this->role?->name);
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(RoleType $role): bool
    {
        return $this->role && $this->role->name === $role->value;
    }

    /**
     * Assign role to user.
     */
    public function assignRole(RoleType $role): void
    {
        $roleModel = RoleModel::where('name', $role->value)->firstOrFail();

        $this->role()->associate($roleModel);
        $this->save();
    }

    /**
     * Shortcut helpers
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole(RoleType::SUPER_ADMIN);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(RoleType::ADMIN);
    }

    public function isGovernor(): bool
    {
        return $this->hasRole(RoleType::GOVERNOR);
    }

    public function isStateCoordinator(): bool
    {
        return $this->hasRole(RoleType::STATE_COORDINATOR);
    }

    public function isZonalCoordinator(): bool
    {
        return $this->hasRole(RoleType::ZONAL_COORDINATOR);
    }

    public function isLgaCoordinator(): bool
    {
        return $this->hasRole(RoleType::LGA_COORDINATOR);
    }

    public function isWardCoordinator(): bool
    {
        return $this->hasRole(RoleType::WARD_COORDINATOR);
    }
}
