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

class WardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Ward::class);
            $stateId = $request->user()->location_id;

            $wards = Ward::query()
                ->whereHas('lga.zone', fn ($q) => $q->where('state_id', $stateId))
                ->with(['lga.zone.state'])
                ->withCount('pus')
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%");
                })
                ->when($request->filled('lga_id'), function ($q) use ($request) {
                    $q->where('lga_id', $request->lga_id);
                })
                ->latest()
                ->paginate()
                ->withQueryString();

            $lgas = Lga::whereHas('zone', fn ($q) => $q->where('state_id', $stateId))
                ->orderBy('name')
                ->get();

            $statistics = [
                'zones' => Zone::where('state_id', $stateId)->count(),
                'lgas'  => Lga::whereHas('zone', fn ($q) => $q->where('state_id', $stateId))->count(),
                'wards' => Ward::whereHas('lga.zone', fn ($q) => $q->where('state_id', $stateId))->count(),
                'pus'   => Pu::whereHas('ward.lga.zone', fn ($q) => $q->where('state_id', $stateId))->count(),
            ];

            return inertia('dashboard/governor/locations/wards/Index', [
                'wards'      => $wards,
                'lgas'       => $lgas,
                'filters'    => $request->only(['search', 'lga_id']),
                'stateName'  => optional(State::find($stateId))->name,
                'statistics' => $statistics,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load wards', ['message' => $e->getMessage(), 'user_id' => $request->user()->id]);

            return back()->withErrors(['general' => 'Unable to load wards.']);
        }
    }
}