<?php

namespace App\Http\Controllers\Governor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileEmailRequest;
use App\Http\Requests\Profile\UpdateProfileInfoRequest;
use App\Http\Requests\Profile\UpdateProfilePasswordRequest;
use App\Services\ProfileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        protected ProfileService $profileService
    ) {}
    
    public function index(Request $request): Response
    {
        return Inertia::render('dashboard/governor/profile/Index', [
            'profile' => $request->user()->load('roles'),
        ]);
    }

    public function updateInfo(UpdateProfileInfoRequest $request)
    {
        try {
            $this->profileService->updateInfo(
                $request->user(),
                $request->validated(),
                $request->file('avatar')
            );

            return back()->with([
                'status' => true,
                'message' => 'Profile updated successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update profile info', [
                'message' => $e->getMessage(),
                'user_id' => $request->user()->id,
            ]);

            return back()->withErrors([
                'general' => 'Failed to update profile.',
            ]);
        }
    }

    public function updateEmail(UpdateProfileEmailRequest $request)
    {
        try {
            $this->profileService->updateEmail(
                $request->user(),
                $request->validated('email')
            );

            return back()->with([
                'status' => true,
                'message' => 'Email updated successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update email', [
                'message' => $e->getMessage(),
                'user_id' => $request->user()->id,
            ]);

            return back()->withErrors([
                'general' => 'Failed to update email.',
            ]);
        }
    }

    public function updatePassword(UpdateProfilePasswordRequest $request)
    {
        try {
            $this->profileService->updatePassword(
                $request->user(),
                $request->validated('password')
            );

            return back()->with([
                'status' => true,
                'message' => 'Password updated successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update password', [
                'message' => $e->getMessage(),
                'user_id' => $request->user()->id,
            ]);

            return back()->withErrors([
                'general' => 'Failed to update password.',
            ]);
        }
    }
}