<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
}
