<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
