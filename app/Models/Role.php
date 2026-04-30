<?php

namespace App\Models;

use App\Enums\Role as RoleEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    use HasUuids;

    /**
     * Roles user is allowed to assign/create
     */
    public function scopeAssignableBy(Builder $query, User $authUser): Builder
    {
        /**
         * SUPER ADMIN → all roles except self role creation optional
         */
        if ($authUser->hasRole(RoleEnum::SUPER_ADMIN->value)) {
            return $query->where('name', '!=', RoleEnum::SUPER_ADMIN->value);
        }

        /**
         * ADMIN → cannot assign super_admin/admin
         */
        if ($authUser->hasRole(RoleEnum::ADMIN->value)) {
            return $query->whereNotIn('name', [
                RoleEnum::SUPER_ADMIN->value,
                RoleEnum::ADMIN->value,
            ]);
        }

        /**
         * Others → based on hierarchy
         */
        $allowedRoles = [];

        foreach ($authUser->getRoleNames() as $role) {
            $allowedRoles = array_merge(
                $allowedRoles,
                User::ROLE_CREATION_MAP[$role] ?? []
            );
        }

        return $query->whereIn('name', array_unique($allowedRoles));
    }
}
