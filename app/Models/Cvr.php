<?php

namespace App\Models;

use App\Enums\CvrStatus;
use App\Enums\CvrType;
use App\Enums\Role;
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
        $role    = $authUser->role?->name;
        $locType = $authUser->location_type;
        $locId   = $authUser->location_id;

        return match ($role) {
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
            Role::GOVERNOR->value => $query,

            Role::STATE_COORDINATOR->value => $query->whereHas('pu.ward.lga.zone', function ($q) use ($locId) {
                $q->where('state_id', $locId);
            }),

            Role::ZONAL_COORDINATOR->value => $query->whereHas('pu.ward.lga', function ($q) use ($locId) {
                $q->where('zone_id', $locId);
            }),

            Role::LGA_COORDINATOR->value => $query->whereHas('pu.ward', function ($q) use ($locId) {
                $q->where('lga_id', $locId);
            }),

            Role::WARD_COORDINATOR->value => $query->whereHas('pu', function ($q) use ($locId) {
                $q->where('ward_id', $locId);
            }),

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
