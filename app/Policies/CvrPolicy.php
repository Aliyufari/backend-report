<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Cvr;
use App\Models\User;

class CvrPolicy
{
    /**
     * Super admin and admin can view any CVR.
     * Coordinators can view CVRs within their jurisdiction.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role?->name, [
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
     * A user can view a CVR if it falls within their jurisdiction.
     */
    public function view(User $user, Cvr $cvr): bool
    {
        return $this->withinJurisdiction($user, $cvr);
    }

    /**
     * Coordinators and above can create CVRs within their jurisdiction.
     */
    public function create(User $user): bool
    {
        return in_array($user->role?->name, [
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
            Role::STATE_COORDINATOR->value,
            Role::ZONAL_COORDINATOR->value,
            Role::LGA_COORDINATOR->value,
            Role::WARD_COORDINATOR->value,
        ]);
    }

    /**
     * Can update if within jurisdiction (Governor and USER cannot update).
     */
    public function update(User $user, Cvr $cvr): bool
    {
        if (!in_array($user->role?->name, [
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
            Role::STATE_COORDINATOR->value,
            Role::ZONAL_COORDINATOR->value,
            Role::LGA_COORDINATOR->value,
            Role::WARD_COORDINATOR->value,
        ])) {
            return false;
        }

        return $this->withinJurisdiction($user, $cvr);
    }

    /**
     * Only super_admin and admin can delete.
     */
    public function delete(User $user, Cvr $cvr): bool
    {
        return in_array($user->role?->name, [
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ]);
    }

    public function restore(User $user, Cvr $cvr): bool
    {
        return $user->role?->name === Role::SUPER_ADMIN->value;
    }

    public function forceDelete(User $user, Cvr $cvr): bool
    {
        return $user->role?->name === Role::SUPER_ADMIN->value;
    }

    // ─────────────────────────────────────────────────────
    // Jurisdiction check — walks up the location tree
    // ─────────────────────────────────────────────────────
    protected function withinJurisdiction(User $user, Cvr $cvr): bool
    {
        $role     = $user->role?->name;
        $locType  = $user->location_type;
        $locId    = $user->location_id;
        $pu       = $cvr->pu;

        if (!$pu) return false;

        return match ($role) {
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
            Role::GOVERNOR->value    => true,

            // State coordinator — CVR's PU must be under their state
            Role::STATE_COORDINATOR->value => $locType === 'state'
                && $pu->ward?->lga?->zone?->state_id === $locId,

            // Zonal coordinator — CVR's PU must be under their zone
            Role::ZONAL_COORDINATOR->value => $locType === 'zone'
                && $pu->ward?->lga?->zone_id === $locId,

            // LGA coordinator — CVR's PU must be under their LGA
            Role::LGA_COORDINATOR->value => $locType === 'lga'
                && $pu->ward?->lga_id === $locId,

            // Ward coordinator — CVR's PU must be under their ward
            Role::WARD_COORDINATOR->value => $locType === 'ward'
                && $pu->ward_id === $locId,

            default => false,
        };
    }
}
