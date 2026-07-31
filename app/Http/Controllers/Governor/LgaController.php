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

class LgaController extends Controller
{
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Lga::class);
            $stateId = $request->user()->location_id;

            $lgas = Lga::query()
                ->whereHas('zone', fn ($q) => $q->where('state_id', $stateId))
                ->with(['zone.state'])
                ->withCount('wards')
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%");
                })
                ->when($request->filled('zone_id'), function ($q) use ($request) {
                    $q->where('zone_id', $request->zone_id);
                })
                ->latest()
                ->paginate()
                ->withQueryString();

            $zones = Zone::where('state_id', $stateId)->orderBy('name')->get();

            $statistics = [
                'zones' => Zone::where('state_id', $stateId)->count(),
                'lgas'  => Lga::whereHas('zone', fn ($q) => $q->where('state_id', $stateId))->count(),
                'wards' => Ward::whereHas('lga.zone', fn ($q) => $q->where('state_id', $stateId))->count(),
                'pus'   => Pu::whereHas('ward.lga.zone', fn ($q) => $q->where('state_id', $stateId))->count(),
            ];

            return inertia('dashboard/governor/locations/lgas/Index', [
                'lgas'       => $lgas,
                'zones'      => $zones,
                'filters'    => $request->only(['search', 'zone_id']),
                'stateName'  => optional(State::find($stateId))->name,
                'statistics' => $statistics,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load LGAs', ['message' => $e->getMessage(), 'user_id' => $request->user()->id]);

            return back()->withErrors(['general' => 'Unable to load LGAs.']);
        }
    }
}