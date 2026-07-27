<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileEmailRequest;
use App\Http\Requests\UpdateProfileInfoRequest;
use App\Http\Requests\UpdateProfilePasswordRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('dashboard/profile/Index', [
            'profile' => $request->user()->load('roles'),
        ]);
    }

    public function updateInfo(UpdateProfileInfoRequest $request)
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

            return back()->with(['status' => true, 'message' => 'Profile updated successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to update profile info', ['message' => $e->getMessage(), 'user_id' => $request->user()->id]);

            return back()->withErrors(['general' => 'Failed to update profile.']);
        }
    }

    public function updateEmail(UpdateProfileEmailRequest $request)
    {
        try {
            $request->user()->update(['email' => $request->validated('email')]);

            return back()->with(['status' => true, 'message' => 'Email updated successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to update email', ['message' => $e->getMessage(), 'user_id' => $request->user()->id]);

            return back()->withErrors(['general' => 'Failed to update email.']);
        }
    }

    public function updatePassword(UpdateProfilePasswordRequest $request)
    {
        try {
            $request->user()->update(['password' => Hash::make($request->validated('password'))]);

            return back()->with(['status' => true, 'message' => 'Password updated successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to update password', ['message' => $e->getMessage(), 'user_id' => $request->user()->id]);

            return back()->withErrors(['general' => 'Failed to update password.']);
        }
    }
}