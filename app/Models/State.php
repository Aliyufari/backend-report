<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class State extends Model
{
    /** @use HasFactory<\Database\Factories\StateFactory> */
    use HasFactory, HasUuids;

    protected $fillable = ['name'];

    public function zones(): HasMany
    {
        return $this->hasMany(Zone::class);
    }
}
