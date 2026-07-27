<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enums\Location;
use App\Enums\Role as RoleEnum;
use App\Traits\HasAudit;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasUuids, HasRoles, HasAudit;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'avatar',
        'name',
        'email',
        'password',
        'location_id',
        'location_type',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'location_type' => Location::class,
        ];
    }

   /**
     * Which roles each role is allowed to create.
     * SUPER_ADMIN is intentionally never a value here — nobody, including
     * super_admin, can create another super_admin through this system.
     */
    public const ROLE_CREATION_MAP = [
        RoleEnum::SUPER_ADMIN->value => [
            RoleEnum::ADMIN->value,
            RoleEnum::GOVERNOR->value,
            RoleEnum::STATE_COORDINATOR->value,
            RoleEnum::ZONAL_COORDINATOR->value,
            RoleEnum::LGA_COORDINATOR->value,
            RoleEnum::WARD_COORDINATOR->value,
        ],
        RoleEnum::ADMIN->value => [
            RoleEnum::GOVERNOR->value,
            RoleEnum::STATE_COORDINATOR->value,
            RoleEnum::ZONAL_COORDINATOR->value,
            RoleEnum::LGA_COORDINATOR->value,
            RoleEnum::WARD_COORDINATOR->value,
        ],
        RoleEnum::GOVERNOR->value => [
            RoleEnum::STATE_COORDINATOR->value,
            RoleEnum::ZONAL_COORDINATOR->value,
            RoleEnum::LGA_COORDINATOR->value,
            RoleEnum::WARD_COORDINATOR->value,
        ],
        RoleEnum::STATE_COORDINATOR->value => [
            RoleEnum::ZONAL_COORDINATOR->value,
            RoleEnum::LGA_COORDINATOR->value,
            RoleEnum::WARD_COORDINATOR->value,
        ],
        RoleEnum::ZONAL_COORDINATOR->value => [
            RoleEnum::LGA_COORDINATOR->value,
            RoleEnum::WARD_COORDINATOR->value,
        ],
        RoleEnum::LGA_COORDINATOR->value => [
            RoleEnum::WARD_COORDINATOR->value,
        ],
    ];

    public function location(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Can this user create an account with the given role?
     * Single source of truth — no role-based early exit, so nobody
     * accidentally bypasses the map (this was the ADMIN-creates-ADMIN leak).
     */
    public function canCreateRole(?string $role): bool
    {
        if (!$role) {
            return false;
        }

        // Nobody creates a second super_admin, ever.
        if ($role === RoleEnum::SUPER_ADMIN->value) {
            return false;
        }

        foreach ($this->getRoleNames() as $creatorRole) {
            $allowed = self::ROLE_CREATION_MAP[$creatorRole] ?? [];

            if (in_array($role, $allowed, true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Can this user assign the given location to a user they're creating/updating?
     * Enforces "coordinators create only within their own location."
     */
    public function canAssignLocation(?string $locationType, ?string $locationId): bool
    {
        if (!$locationType || !$locationId) {
            return false;
        }

        // Only these two are exempt from location scoping.
        if ($this->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
        ])) {
            return true;
        }

        if (!$this->location_type || !$this->location_id) {
            return false;
        }

        $creatorType = $this->location_type->value;
        $creatorId   = $this->location_id;

        if ($locationType === $creatorType) {
            return $locationId === $creatorId;
        }

        return match ($creatorType) {
            Location::STATE->value => match ($locationType) {
                Location::ZONE->value => Zone::whereKey($locationId)->where('state_id', $creatorId)->exists(),
                Location::LGA->value  => Lga::whereKey($locationId)->whereHas('zone', fn($q) => $q->where('state_id', $creatorId))->exists(),
                Location::WARD->value => Ward::whereKey($locationId)->whereHas('lga.zone', fn($q) => $q->where('state_id', $creatorId))->exists(),
                Location::PU->value   => Pu::whereKey($locationId)->whereHas('ward.lga.zone', fn($q) => $q->where('state_id', $creatorId))->exists(),
                default => false,
            },
            Location::ZONE->value => match ($locationType) {
                Location::LGA->value  => Lga::whereKey($locationId)->where('zone_id', $creatorId)->exists(),
                Location::WARD->value => Ward::whereKey($locationId)->whereHas('lga', fn($q) => $q->where('zone_id', $creatorId))->exists(),
                Location::PU->value   => Pu::whereKey($locationId)->whereHas('ward.lga', fn($q) => $q->where('zone_id', $creatorId))->exists(),
                default => false,
            },
            Location::LGA->value => match ($locationType) {
                Location::WARD->value => Ward::whereKey($locationId)->where('lga_id', $creatorId)->exists(),
                Location::PU->value   => Pu::whereKey($locationId)->whereHas('ward', fn($q) => $q->where('lga_id', $creatorId))->exists(),
                default => false,
            },
            Location::WARD->value => match ($locationType) {
                Location::PU->value => Pu::whereKey($locationId)->where('ward_id', $creatorId)->exists(),
                default => false,
            },
            default => false,
        };
    }

    /**
     * Can $this see/manage $target through the role hierarchy + location scope?
     * Single source of truth for view/update/delete — no bypasses.
     */
    private function isWithinHierarchy(User $target): bool
    {
        // Never manage yourself.
        if ($this->is($target)) {
            return false;
        }

        // Super Admin can manage everyone except themselves.
        if ($this->hasRole(RoleEnum::SUPER_ADMIN->value)) {
            return true;
        }

        // Admin cannot manage Super Admins.
        if ($this->hasRole(RoleEnum::ADMIN->value)) {
            return !$target->hasRole(RoleEnum::SUPER_ADMIN->value);
        }

        // Role hierarchy
        $blockedRoles = match (true) {

            $this->hasRole(RoleEnum::GOVERNOR->value) => [
                RoleEnum::SUPER_ADMIN->value,
                RoleEnum::ADMIN->value,
                RoleEnum::GOVERNOR->value,
            ],

            $this->hasRole(RoleEnum::STATE_COORDINATOR->value) => [
                RoleEnum::SUPER_ADMIN->value,
                RoleEnum::ADMIN->value,
                RoleEnum::GOVERNOR->value,
                RoleEnum::STATE_COORDINATOR->value,
            ],

            $this->hasRole(RoleEnum::ZONAL_COORDINATOR->value) => [
                RoleEnum::SUPER_ADMIN->value,
                RoleEnum::ADMIN->value,
                RoleEnum::GOVERNOR->value,
                RoleEnum::STATE_COORDINATOR->value,
                RoleEnum::ZONAL_COORDINATOR->value,
            ],

            $this->hasRole(RoleEnum::LGA_COORDINATOR->value) => [
                RoleEnum::SUPER_ADMIN->value,
                RoleEnum::ADMIN->value,
                RoleEnum::GOVERNOR->value,
                RoleEnum::STATE_COORDINATOR->value,
                RoleEnum::ZONAL_COORDINATOR->value,
                RoleEnum::LGA_COORDINATOR->value,
            ],

            $this->hasRole(RoleEnum::WARD_COORDINATOR->value) => [
                RoleEnum::SUPER_ADMIN->value,
                RoleEnum::ADMIN->value,
                RoleEnum::GOVERNOR->value,
                RoleEnum::STATE_COORDINATOR->value,
                RoleEnum::ZONAL_COORDINATOR->value,
                RoleEnum::LGA_COORDINATOR->value,
                RoleEnum::WARD_COORDINATOR->value,
            ],

            default => [],
        };

        foreach ($blockedRoles as $role) {
            if ($target->hasRole($role)) {
                return false;
            }
        }

        // Location scope
        return match ($this->location_type?->value) {

            Location::STATE->value =>
                optional($target->location?->state)->id === $this->location_id,

            Location::ZONE->value =>
                optional($target->location?->zone)->id === $this->location_id,

            Location::LGA->value =>
                optional($target->location?->lga)->id === $this->location_id,

            Location::WARD->value =>
                optional($target->location?->ward)->id === $this->location_id,

            Location::PU->value =>
                $target->location_id === $this->location_id,

            default => false,
        };
    }

    public function canAccessUser(User $target): bool
    {
        return $this->isWithinHierarchy($target);
    }

    public function canManageUser(User $target, string $action): bool
    {
        return match ($action) {
            'update', 'delete' => $this->isWithinHierarchy($target),
            default => false,
        };
    }

    /**
     * Scope visibility by hierarchy + role restrictions
     */
    public function scopeVisibleTo(Builder $query, User $authUser): Builder
    {
        // Never show yourself.
        $query->whereKeyNot($authUser->id);

        // SUPER ADMIN
        if ($authUser->hasRole(RoleEnum::SUPER_ADMIN->value)) {
            return $query;
        }

        // ADMIN
        if ($authUser->hasRole(RoleEnum::ADMIN->value)) {
            return $query->whereDoesntHave('roles', function ($q) {
                $q->where('name', RoleEnum::SUPER_ADMIN->value);
            });
        }

        // GOVERNOR
        if ($authUser->hasRole(RoleEnum::GOVERNOR->value)) {

            $query->whereDoesntHave('roles', function ($q) {
                $q->whereIn('name', [
                    RoleEnum::SUPER_ADMIN->value,
                    RoleEnum::ADMIN->value,
                    RoleEnum::GOVERNOR->value,
                ]);
            });

        }

        // STATE COORDINATOR
        elseif ($authUser->hasRole(RoleEnum::STATE_COORDINATOR->value)) {

            $query->whereDoesntHave('roles', function ($q) {
                $q->whereIn('name', [
                    RoleEnum::SUPER_ADMIN->value,
                    RoleEnum::ADMIN->value,
                    RoleEnum::GOVERNOR->value,
                    RoleEnum::STATE_COORDINATOR->value,
                ]);
            });

        }

        // ZONAL COORDINATOR
        elseif ($authUser->hasRole(RoleEnum::ZONAL_COORDINATOR->value)) {

            $query->whereDoesntHave('roles', function ($q) {
                $q->whereIn('name', [
                    RoleEnum::SUPER_ADMIN->value,
                    RoleEnum::ADMIN->value,
                    RoleEnum::GOVERNOR->value,
                    RoleEnum::STATE_COORDINATOR->value,
                    RoleEnum::ZONAL_COORDINATOR->value,
                ]);
            });

        }

        // LGA COORDINATOR
        elseif ($authUser->hasRole(RoleEnum::LGA_COORDINATOR->value)) {

            $query->whereDoesntHave('roles', function ($q) {
                $q->whereIn('name', [
                    RoleEnum::SUPER_ADMIN->value,
                    RoleEnum::ADMIN->value,
                    RoleEnum::GOVERNOR->value,
                    RoleEnum::STATE_COORDINATOR->value,
                    RoleEnum::ZONAL_COORDINATOR->value,
                    RoleEnum::LGA_COORDINATOR->value,
                ]);
            });

        }

        // WARD COORDINATOR
        elseif ($authUser->hasRole(RoleEnum::WARD_COORDINATOR->value)) {

            $query->whereDoesntHave('roles', function ($q) {
                $q->whereIn('name', [
                    RoleEnum::SUPER_ADMIN->value,
                    RoleEnum::ADMIN->value,
                    RoleEnum::GOVERNOR->value,
                    RoleEnum::STATE_COORDINATOR->value,
                    RoleEnum::ZONAL_COORDINATOR->value,
                    RoleEnum::LGA_COORDINATOR->value,
                    RoleEnum::WARD_COORDINATOR->value,
                ]);
            });

        }

        // Finally, apply location restriction.
        return $query->whereHas('location', function ($locationQuery) use ($authUser) {

            match ($authUser->location_type?->value) {

                Location::STATE->value =>
                    $locationQuery->whereHas(
                        'state',
                        fn($q) => $q->whereKey($authUser->location_id)
                    ),

                Location::ZONE->value =>
                    $locationQuery->whereHas(
                        'zone',
                        fn($q) => $q->whereKey($authUser->location_id)
                    ),

                Location::LGA->value =>
                    $locationQuery->whereHas(
                        'lga',
                        fn($q) => $q->whereKey($authUser->location_id)
                    ),

                Location::WARD->value =>
                    $locationQuery->whereHas(
                        'ward',
                        fn($q) => $q->whereKey($authUser->location_id)
                    ),

                Location::PU->value =>
                    $locationQuery->whereKey($authUser->location_id),

                default => null,
            };

        });
    }

    public const ROLE_DASHBOARD_ROUTES = [
        RoleEnum::SUPER_ADMIN->value       => 'admin.dashboard',
        RoleEnum::ADMIN->value             => 'admin.dashboard',
        RoleEnum::GOVERNOR->value          => 'governor.dashboard',
        RoleEnum::STATE_COORDINATOR->value => 'coordinator.dashboard',
        RoleEnum::ZONAL_COORDINATOR->value => 'coordinator.dashboard',
        RoleEnum::LGA_COORDINATOR->value   => 'coordinator.dashboard',
        RoleEnum::WARD_COORDINATOR->value  => 'coordinator.dashboard',
    ];

    public function dashboardRouteName(): string
    {
        $role = $this->getRoleNames()->first();

        return self::ROLE_DASHBOARD_ROUTES[$role] ?? 'dashboard.no-role';
    }
}
