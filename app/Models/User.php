<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enums\Location;
use App\Traits\HasAudit;
use App\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

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
        'role_id',
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

    public function role(): BelongsTo
    {
        return $this->belongsTo(
            Role::class
        );
    }

    public function location()
    {
        return match ($this->location_type) {
            Location::STATE => $this->belongsTo(State::class, 'location_id'),
            Location::ZONE => $this->belongsTo(Zone::class, 'location_id'),
            Location::LGA => $this->belongsTo(Lga::class, 'location_id'),
            Location::WARD => $this->belongsTo(Ward::class, 'location_id'),
            Location::PU => $this->belongsTo(Pu::class, 'location_id'),
            default => null,
        };
    }

    public function canAccessUser(User $target): bool
    {
        if ($this->isSuperAdmin() || $this->isAdmin() || $this->isGovernor()) {
            return true;
        }

        if ($this->location_type === Location::STATE) {
            return $target->location()
                ->whereHas(
                    'state',
                    fn($q) =>
                    $q->where('id', $this->location_id)
                )->exists();
        }

        if ($this->location_type === Location::ZONE) {
            return $target->location()
                ->whereHas(
                    'zone',
                    fn($q) =>
                    $q->where('id', $this->location_id)
                )->exists();
        }

        if ($this->location_type === Location::LGA) {
            return $target->location()
                ->whereHas(
                    'lga',
                    fn($q) =>
                    $q->where('id', $this->location_id)
                )->exists();
        }

        if ($this->location_type === Location::WARD) {
            return $target->location()
                ->where('ward_id', $this->location_id)
                ->exists();
        }

        return false;
    }

    public function scopeVisibleTo($query, User $authUser)
    {
        if ($authUser->isSuperAdmin() || $authUser->isAdmin() || $authUser->isGovernor()) {
            return $query;
        }

        return $query->whereHasMorph(
            'location',
            ['*'],
            function ($q) use ($authUser) {

                match ($authUser->location_type) {

                    Location::STATE =>
                    $q->where('state_id', $authUser->location_id),

                    Location::ZONE =>
                    $q->where('zone_id', $authUser->location_id),

                    Location::LGA =>
                    $q->where('lga_id', $authUser->location_id),

                    Location::WARD =>
                    $q->where('ward_id', $authUser->location_id),
                };
            }
        );
    }
}
