<?php

namespace App\Models;

use App\Enums\CvrStatus;
use App\Enums\CvrType;
use App\Enums\Role;
use App\Enums\Location as LocationEnum;
use App\Traits\HasAudit;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cvr extends Model
{
    /** @use HasFactory<\Database\Factories\CvrFactory> */
    use HasFactory, HasUuids, HasAudit;

    protected $fillable = [
        'unique_id',
        'type',
        'status',
        'pu_id'
    ];

    protected $casts = [
        'type'   => CvrType::class,
        'status' => CvrStatus::class,
    ];

    public function pu(): BelongsTo
    {
        return $this->belongsTo(Pu::class);
    }

    public function scopeVisibleTo($query, User $authUser)
    {
        if ($authUser->hasRole(Role::SUPER_ADMIN->value)) {
            return $query;
        }

        if ($authUser->hasRole(Role::ADMIN->value)) {
            return $query;
        }

        $locType = $authUser->location_type?->value;
        $locId   = $authUser->location_id;

        return match ($locType) {
            LocationEnum::STATE->value => $query->whereHas('pu.ward.lga.zone', fn($q) => $q->where('state_id', $locId)),
            LocationEnum::ZONE->value  => $query->whereHas('pu.ward.lga', fn($q) => $q->where('zone_id', $locId)),
            LocationEnum::LGA->value   => $query->whereHas('pu.ward', fn($q) => $q->where('lga_id', $locId)),
            LocationEnum::WARD->value  => $query->whereHas('pu', fn($q) => $q->where('ward_id', $locId)),
            default => $query->whereRaw('1 = 0'),
        };
    }

    public static function generateUniqueId(): string
    {
        do {
            $numbers = str_pad(rand(0, 99999999), 8, '0', STR_PAD_LEFT);
            $id = 'PRE' . $numbers;
        } while (self::where('unique_id', $id)->exists());

        return $id;
    }
}
