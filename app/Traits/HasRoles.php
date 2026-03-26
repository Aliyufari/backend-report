<?php

namespace App\Traits;

use App\Enums\Role as RoleEnum;
use App\Models\Role as RoleModel;

trait HasRoles
{
    public function roleEnum(): ?RoleEnum
    {
        return RoleEnum::tryFrom($this->role?->name);
    }

    public function hasRole(RoleEnum $role): bool
    {
        return $this->role?->name === $role->value;
    }

    public function assignRole(RoleEnum $role): void
    {
        $roleModel = RoleModel::where('name', $role->value)->firstOrFail();
        $this->role()->associate($roleModel)->save();
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(RoleEnum::SUPER_ADMIN);
    }
    public function isAdmin(): bool
    {
        return $this->hasRole(RoleEnum::ADMIN);
    }
    public function isGovernor(): bool
    {
        return $this->hasRole(RoleEnum::GOVERNOR);
    }
    public function isStateCoordinator(): bool
    {
        return $this->hasRole(RoleEnum::STATE_COORDINATOR);
    }
    public function isZonalCoordinator(): bool
    {
        return $this->hasRole(RoleEnum::ZONAL_COORDINATOR);
    }
    public function isLgaCoordinator(): bool
    {
        return $this->hasRole(RoleEnum::LGA_COORDINATOR);
    }
    public function isWardCoordinator(): bool
    {
        return $this->hasRole(RoleEnum::WARD_COORDINATOR);
    }
    public function isUser(): bool
    {
        return $this->hasRole(RoleEnum::USER);
    }

    public function canManageUsers(): bool
    {
        return $this->isSuperAdmin()
            || $this->isAdmin()
            || $this->isGovernor()
            || $this->isStateCoordinator()
            || $this->isZonalCoordinator()
            || $this->isLgaCoordinator();
    }

    public function isLowestCoordinator(): bool
    {
        return $this->isWardCoordinator();
    }
}
