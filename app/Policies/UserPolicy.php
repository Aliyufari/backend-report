<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $authUser): bool
    {
        return $authUser->canManageUsers();
    }

    public function view(User $authUser, User $user): bool
    {
        return $authUser->canAccessUser($user);
    }

    public function create(User $authUser): bool
    {
        return $authUser->canManageUsers();
    }

    public function update(User $authUser, User $user): bool
    {
        return $authUser->canAccessUser($user);
    }

    public function delete(User $authUser, User $user): bool
    {
        return $authUser->canAccessUser($user);
    }
}
