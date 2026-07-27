<?php

namespace App\Models;

use App\Enums\Location;
use App\Enums\RecordStatus;
use App\Enums\Role;
use App\Traits\HasAudit;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Accreditation extends Model
{
    use HasFactory, HasUuids, HasAudit;

    protected $fillable = ['election_id', 'pu_id', 'accredited_voters', 'image_path', 'status'];

    protected $casts = ['status' => RecordStatus::class];

    public function election(): BelongsTo
    {
        return $this->belongsTo(Election::class);
    }

    public function pu(): BelongsTo
    {
        return $this->belongsTo(Pu::class);
    }

    public function scopeVisibleTo($query, User $authUser)
    {
        if ($authUser->hasAnyRole([Role::SUPER_ADMIN->value, Role::ADMIN->value])) {
            return $query;
        }

        $locId = $authUser->location_id;

        return match ($authUser->location_type?->value) {
            Location::STATE->value => $query->whereHas('pu.ward.lga.zone', fn($q) => $q->where('state_id', $locId)),
            Location::ZONE->value  => $query->whereHas('pu.ward.lga', fn($q) => $q->where('zone_id', $locId)),
            Location::LGA->value   => $query->whereHas('pu.ward', fn($q) => $q->where('lga_id', $locId)),
            Location::WARD->value  => $query->whereHas('pu', fn($q) => $q->where('ward_id', $locId)),
            default => $query->whereRaw('1 = 0'),
        };
    }
}