<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    /**
     * Update the user's basic information.
     */
    public function updateInfo(User $user, array $data, ?UploadedFile $avatar = null): User
    {
        if ($avatar) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $data['avatar'] = $avatar->store('avatars', 'public');
        }

        $user->update($data);

        return $user->refresh();
    }

    /**
     * Update the user's email.
     */
    public function updateEmail(User $user, string $email): User
    {
        $user->update([
            'email' => $email,
        ]);

        return $user->refresh();
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(User $user, string $password): User
    {
        $user->update([
            'password' => Hash::make($password),
        ]);

        return $user->refresh();
    }

    /**
     * Delete the current avatar.
     */
    public function deleteAvatar(User $user): User
    {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);

            $user->update([
                'avatar' => null,
            ]);
        }

        return $user->refresh();
    }
}