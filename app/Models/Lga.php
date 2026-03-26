<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lga extends Model
{
    /** @use HasFactory<\Database\Factories\LgaFactory> */
    use HasFactory, HasUuids;

    protected $fillable = ['name', 'zone_id'];

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    public function wards(): HasMany
    {
        return $this->hasMany(Ward::class);
    }
}
