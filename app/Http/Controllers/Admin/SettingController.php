<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;

class SettingController extends Controller
{
    protected array $keys = [
        'election_countdown_date',
        'election_countdown_label',
        'site_name',
        'support_email',
    ];

    public function index()
    {
        $this->authorize('viewAny', Setting::class);

        return inertia('dashboard/admin/settings/Index', [
            'settings' => Setting::many($this->keys),
        ]);
    }

    public function update(UpdateSettingsRequest $request)
    {
        try {
            foreach ($request->validated() as $key => $value) {
                Setting::set($key, $value);
            }

            return back()->with(['status' => true, 'message' => 'Settings updated successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to update settings', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Failed to update settings. Please try again.']);
        }
    }
}