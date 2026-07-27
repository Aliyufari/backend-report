<?php

namespace App\Http\Controllers\Governor;

use App\Http\Controllers\Controller;
use App\Models\Pu;
use App\Models\Ward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PuController extends Controller
{
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Pu::class);
            $stateId = $request->user()->location_id;

            $pus = Pu::query()
                ->whereHas('ward.lga.zone', fn ($q) => $q->where('state_id', $stateId))
                ->with(['ward.lga.zone.state'])
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->where(function ($query) use ($request) {
                        $query->where('name', 'like', "%{$request->search}%")
                              ->orWhere('code', 'like', "%{$request->search}%");
                    });
                })
                ->when($request->filled('ward_id'), function ($q) use ($request) {
                    $q->where('ward_id', $request->ward_id);
                })
                ->latest()
                ->paginate()
                ->withQueryString();

            $wards = Ward::whereHas('lga.zone', fn ($q) => $q->where('state_id', $stateId))
                ->orderBy('name')
                ->get();

            return inertia('dashboard/governor/locations/pus/Index', [
                'pus'     => $pus,
                'wards'   => $wards,
                'filters' => $request->only(['search', 'ward_id']),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load polling units', ['message' => $e->getMessage(), 'user_id' => $request->user()->id]);

            return back()->withErrors(['general' => 'Unable to load polling units.']);
        }
    }
}