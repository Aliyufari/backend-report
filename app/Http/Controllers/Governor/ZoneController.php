<?php

namespace App\Http\Controllers\Governor;

use App\Http\Controllers\Controller;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ZoneController extends Controller
{
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Zone::class);
            $stateId = $request->user()->location_id;

            $zones = Zone::query()
                ->where('state_id', $stateId)
                ->with(['state'])
                ->withCount('lgas')
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%");
                })
                ->latest()
                ->paginate()
                ->withQueryString();

            return inertia('dashboard/governor/locations/zones/Index', [
                'zones'   => $zones,
                'filters' => $request->only(['search']),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load zones', ['message' => $e->getMessage(), 'user_id' => $request->user()->id]);

            return back()->withErrors(['general' => 'Unable to load zones.']);
        }
    }
}