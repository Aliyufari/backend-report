<?php

namespace App\Traits;

use App\Enums\Location;
use App\Models\Lga;
use App\Models\State;
use App\Models\User;
use App\Models\Ward;
use App\Models\Zone;

trait ScopesOwnLocation
{
    /**
     * Location tree rooted at the acting user's own location.
     * A zone-scoped user gets their zone and everything below it;
     * nothing above or beside it is ever included.
     */
    protected function buildLocations(User $user): array
    {
        return match ($user->location_type?->value) {
            Location::STATE->value =>
                State::with(['zones.lgas.wards.pus'])->where('id', $user->location_id)->get()->toArray(),

            Location::ZONE->value =>
                Zone::with(['lgas.wards.pus'])->where('id', $user->location_id)->get()->toArray(),

            Location::LGA->value =>
                Lga::with(['wards.pus'])->where('id', $user->location_id)->get()->toArray(),

            Location::WARD->value =>
                Ward::with(['pus'])->where('id', $user->location_id)->get()->toArray(),

            default => [],
        };
    }

    protected function locationScope(User $user): string
    {
        return $user->location_type?->value ?? 'state';
    }
}
