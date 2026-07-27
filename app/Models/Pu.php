<?php

namespace App\Models;

use App\Enums\Location as LocationEnum;
use App\Enums\Role as RoleEnum;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Pu extends Model
{
    /** @use HasFactory<\Database\Factories\PuFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'code',
        'name',
        'ward_id'
    ];

    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class);
    }

    public function users(): MorphMany
    {
        return $this->morphMany(User::class, 'location');
    }

    public function cvrs(): HasMany
    {
        return $this->hasMany(Cvr::class);
    }

    public function accreditations(): HasMany
    {
        return $this->hasMany(Accreditation::class);
    }

    public function isWithinJurisdictionOf(User $user): bool
    {
        if ($user->hasAnyRole([
            RoleEnum::SUPER_ADMIN->value,
            RoleEnum::ADMIN->value,
        ])) {
            return true;
        }

        $locId = $user->location_id;

        return match ($user->location_type?->value) {
            LocationEnum::STATE->value => $this->ward?->lga?->zone?->state_id === $locId,
            LocationEnum::ZONE->value  => $this->ward?->lga?->zone_id === $locId,
            LocationEnum::LGA->value   => $this->ward?->lga_id === $locId,
            LocationEnum::WARD->value  => $this->ward_id === $locId,
            default => false,
        };
    }
}
