<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\UpdateProfileRequest;

class ProfileController extends Controller
{
    /**
     * Show the profile page.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('dashboard/profile/Index', [
            'profile' => $request->user()->load('role'),
        ]);
    }

    /**
     * Update name and avatar.
     */
    public function updateInfo(UpdateProfileRequest $request)
    {
        try {
            $user = $request->user();
            $data = $request->validated();

            if ($request->hasFile('avatar')) {
                if ($user->avatar) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
            }

            $user->update($data);

            return back()->with([
                'status'  => true,
                'message' => 'Profile updated successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update profile info', ['message' => $e->getMessage()]);
            return back()->with([
                'status'  => false,
                'message' => 'Failed to update profile.',
            ]);
        }
    }

    /**
     * Update email only.
     */
    public function updateEmail(Request $request)
    {
        try {
            $request->validate([
                'email'    => ['required', 'email', 'unique:users,email,' . $request->user()->id],
                'password' => ['required', 'current_password'],
            ]);

            $request->user()->update(['email' => $request->email]);

            return back()->with([
                'status'  => true,
                'message' => 'Email updated successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update email', ['message' => $e->getMessage()]);
            return back()->with([
                'status'  => false,
                'message' => 'Failed to update email.',
            ]);
        }
    }

    /**
     * Update password.
     */
    public function updatePassword(Request $request)
    {
        try {
            $request->validate([
                'current_password'      => ['required', 'current_password'],
                'password'              => ['required', 'min:8', 'confirmed'],
                'password_confirmation' => ['required'],
            ]);

            $request->user()->update([
                'password' => Hash::make($request->password),
            ]);

            return back()->with([
                'status'  => true,
                'message' => 'Password updated successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update password', ['message' => $e->getMessage()]);
            return back()->with([
                'status'  => false,
                'message' => 'Failed to update password.',
            ]);
        }
    }
}
