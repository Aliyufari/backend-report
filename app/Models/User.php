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

    protected $keyType = 'string';
    public $incrementing = false;

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

    public const ROLE_CREATION_MAP = [
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
        ]
    ];

    public function location(): MorphTo
    {
        return $this->morphTo();
    }

    public function canCreateRole(?string $role): bool
    {
        if (!$role) {
            return false;
        }

        if ($this->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value])) {
            return true;
        }

        $creatorRoles = $this->getRoleNames()->toArray();

        foreach ($creatorRoles as $creatorRole) {
            $allowed = self::ROLE_CREATION_MAP[$creatorRole] ?? [];

            if (in_array($role, $allowed, true)) {
                return true;
            }
        }

        return false;
    }

    private function isWithinHierarchy(User $target): bool
    {
        if ($this->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value, RoleEnum::GOVERNOR->value])) {
            return true;
        }

        if (!$this->location || !$target->location) {
            return false;
        }

        return match ($this->location_type) {

            'state' =>
            optional($target->location->state)->id === $this->location_id,

            'zone' =>
            optional($target->location->zone)->id === $this->location_id,

            'lga' =>
            optional($target->location->lga)->id === $this->location_id,

            'ward' =>
            optional($target->location->ward)->id === $this->location_id,

            'pu' =>
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
        if ($this->hasAnyRole([RoleEnum::SUPER_ADMIN->value, RoleEnum::ADMIN->value])) {
            return true;
        }

        return match ($action) {

            'create' => $this->canCreateRole($target->getRoleNames()->first())
                && $this->isWithinHierarchy($target),

            'update' => $this->isWithinHierarchy($target),

            'delete' => $this->isWithinHierarchy($target),

            default => false,
        };
    }

    /**
     * Scope visibility by hierarchy + role restrictions
     */
    public function scopeVisibleTo(Builder $query, User $authUser): Builder
    {
        /**
         * Always exclude self
         */
        $query->whereKeyNot($authUser->id);

        /**
         * SUPER ADMIN → see all except self
         */
        if ($authUser->hasRole(RoleEnum::SUPER_ADMIN->value)) {
            return $query;
        }

        /**
         * Nobody except super_admin sees super_admin
         */
        $query->whereDoesntHave('roles', function ($roleQuery) {
            $roleQuery->where('name', RoleEnum::SUPER_ADMIN->value);
        });

        /**
         * ADMIN cannot see ADMIN users
         */
        if ($authUser->hasRole(RoleEnum::ADMIN->value)) {
            return $query->whereDoesntHave('roles', function ($roleQuery) {
                $roleQuery->where('name', RoleEnum::ADMIN->value);
            });
        }

        /**
         * GOVERNOR → can see everyone below except admin/super_admin
         */
        if ($authUser->hasRole(RoleEnum::GOVERNOR->value)) {
            return $query;
        }

        /**
         * Hierarchical location filtering
         */
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
}
