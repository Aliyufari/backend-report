<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Zone extends Model
{
    /** @use HasFactory<\Database\Factories\ZoneFactory> */
    use HasFactory, HasUuids;

    protected $fillable = ['name', 'state_id'];

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function lgas(): HasMany
    {
        return $this->hasMany(Lga::class);
    }
}
