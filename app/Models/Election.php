<?php

namespace App\Models;

use App\Enums\ElectionStatus;
use App\Enums\ElectionType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Election extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['title', 'type', 'election_date', 'status'];

    protected $casts = [
        'status'        => ElectionStatus::class,
        'type'          => ElectionType::class,
        'election_date' => 'date',
    ];
}