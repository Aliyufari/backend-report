<?php

namespace App\Http\Controllers\Governor;

use App\Http\Controllers\Controller;
use App\Models\Lga;
use App\Models\Pu;
use App\Models\State;
use App\Models\Ward;
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

            $statistics = [
                'zones' => Zone::where('state_id', $stateId)->count(),
                'lgas'  => Lga::whereHas('zone', fn ($q) => $q->where('state_id', $stateId))->count(),
                'wards' => Ward::whereHas('lga.zone', fn ($q) => $q->where('state_id', $stateId))->count(),
                'pus'   => Pu::whereHas('ward.lga.zone', fn ($q) => $q->where('state_id', $stateId))->count(),
            ];

            return inertia('dashboard/governor/locations/zones/Index', [
                'zones'      => $zones,
                'filters'    => $request->only(['search']),
                'stateName'  => optional(State::find($stateId))->name,
                'statistics' => $statistics,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load zones', ['message' => $e->getMessage(), 'user_id' => $request->user()->id]);

            return back()->withErrors(['general' => 'Unable to load zones.']);
        }
    }
}