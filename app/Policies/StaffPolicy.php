<?php

namespace App\Policies;

use App\Enums\Role as RoleEnum;
use App\Models\Staff;
use App\Models\User;

class StaffPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
            RoleEnum::GOVERNOR->value,
        ]);
    }

    public function view(User $user, Staff $staff): bool
    {
        return $this->withinJurisdiction($user, $staff);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
            RoleEnum::GOVERNOR->value,
        ]);
    }

    public function update(User $user, Staff $staff): bool
    {
        if (! $user->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
            RoleEnum::GOVERNOR->value,
        ])) {
            return false;
        }

        return $this->withinJurisdiction($user, $staff);
    }

    public function delete(User $user, Staff $staff): bool
    {
        if (! $user->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
            RoleEnum::GOVERNOR->value,
        ])) {
            return false;
        }

        return $this->withinJurisdiction($user, $staff);
    }

    /**
     * Admin/super_admin manage everyone. A governor may only manage
     * staff explicitly assigned to their own state — never HQ staff
     * (state_id null) and never another state's staff.
     */
    protected function withinJurisdiction(User $user, Staff $staff): bool
    {
        if ($user->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value])) {
            return true;
        }

        if ($user->hasRole(RoleEnum::GOVERNOR->value)) {
            return $staff->state_id !== null && $staff->state_id === $user->location_id;
        }

        return false;
    }
}