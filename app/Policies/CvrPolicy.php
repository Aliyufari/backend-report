<?php

namespace App\Policies;

use App\Enums\Role as RoleEnum;
use App\Models\Cvr;
use App\Models\User;

class CvrPolicy
{
    /**
     * Anyone in the system hierarchy can view list
     */
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

    /**
     * View single CVR (strict jurisdiction check)
     */
    public function view(User $user, Cvr $cvr): bool
    {
        return $this->withinJurisdiction($user, $cvr);
    }

    /**
     * Create CVR (based on role only)
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
            RoleEnum::STATE_COORDINATOR->value,
            RoleEnum::ZONAL_COORDINATOR->value,
            RoleEnum::LGA_COORDINATOR->value,
            RoleEnum::WARD_COORDINATOR->value,
        ]);
    }

    /**
     * Update CVR
     */
    public function update(User $user, Cvr $cvr): bool
    {
        if (! $this->canManage($user)) {
            return false;
        }

        return $this->withinJurisdiction($user, $cvr);
    }

    /**
     * Delete CVR
     */
    public function delete(User $user, Cvr $cvr): bool
    {
        return $user->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
        ]);
    }

    public function restore(User $user, Cvr $cvr): bool
    {
        return $user->hasRole(RoleEnum::SUPER_ADMIN->value);
    }

    public function forceDelete(User $user, Cvr $cvr): bool
    {
        return $user->hasRole(RoleEnum::SUPER_ADMIN->value);
    }

    /**
     * Central permission check for editable roles
     */
    private function canManage(User $user): bool
    {
        return $user->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
            RoleEnum::STATE_COORDINATOR->value,
            RoleEnum::ZONAL_COORDINATOR->value,
            RoleEnum::LGA_COORDINATOR->value,
            RoleEnum::WARD_COORDINATOR->value,
        ]);
    }

    /**
     * Jurisdiction check (IMPORTANT LOGIC CORE)
     */
    protected function withinJurisdiction(User $user, Cvr $cvr): bool
    {
        return $cvr->pu ? $cvr->pu->isWithinJurisdictionOf($user) : false;
    }
}