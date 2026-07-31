<?php

namespace App\Models;

use App\Enums\Department;
use App\Enums\Role;
use App\Enums\StaffStatus;
use App\Traits\HasAudit;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Staff extends Model
{
    use HasFactory, HasUuids, HasAudit;

    protected $table = 'staff';

    protected $fillable = [
        'staff_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'department',
        'position',
        'status',
        'state_id',
        'date_joined',
    ];

    protected $casts = [
        'department'  => Department::class,
        'status'      => StaffStatus::class,
        'date_joined' => 'date',
    ];

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Admin sees everyone (HQ + every state). A governor sees HQ staff
     * (state_id null) plus staff assigned to their own state — staff
     * has no zone/lga/ward granularity, so this is the whole scope.
     */
    public function scopeVisibleTo($query, User $authUser)
    {
        if ($authUser->hasAnyRole([Role::SUPER_ADMIN->value, Role::ADMIN->value])) {
            return $query;
        }

        if ($authUser->hasRole(Role::GOVERNOR->value)) {
            return $query->where(function ($q) use ($authUser) {
                $q->whereNull('state_id')
                    ->orWhere('state_id', $authUser->location_id);
            });
        }

        return $query->whereRaw('1 = 0');
    }

    public function isAssignableBy(User $user): bool
    {
        if ($user->hasAnyRole([Role::SUPER_ADMIN->value, Role::ADMIN->value])) {
            return true;
        }

        if ($user->hasRole(Role::GOVERNOR->value)) {
            return $this->state_id !== null && $this->state_id === $user->location_id;
        }

        return false;
    }
}