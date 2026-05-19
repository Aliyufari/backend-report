<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreZoneRequest;
use App\Http\Requests\UpdateZoneRequest;
use App\Models\State;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ZoneController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Zone::class);
 
            $zones = Zone::query()
                ->with(['state'])
                ->withCount(['lgas', 'users'])
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%");
                })
                ->when($request->filled('state_id'), function ($q) use ($request) {
                    $q->where('state_id', $request->state_id);
                })
                ->latest()
                ->paginate()
                ->withQueryString();
 
            $states = State::orderBy('name')->get();
 
            return inertia('dashboard/admin/locations/zones/Index', [
                'zones'   => $zones,
                'states'  => $states,
                'filters' => $request->only(['search', 'state_id']),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load zones', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => 'Unable to load zones',
            ]);
        }
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreZoneRequest $request)
    {
        try {
            $this->authorize('create', Zone::class);
 
            DB::transaction(function () use ($request) {
                Zone::create($request->validated());
            });
 
            return redirect()->route('zones.index')->with([
                'status'  => true,
                'message' => 'Zone created successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to create zone', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to create zone',
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateZoneRequest $request, Zone $zone)
    {
        try {
            $this->authorize('update', $zone);
 
            DB::transaction(function () use ($request, $zone) {
                $zone->update($request->validated());
            });
 
            return redirect()->route('zones.index')->with([
                'status'  => true,
                'message' => 'Zone updated successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update zone', [
                'message' => $e->getMessage(),
                'zone_id' => $zone->id,
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to update zone',
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Zone $zone)
    {
        try {
            $this->authorize('delete', $zone);
 
            DB::transaction(function () use ($zone) {
                $zone->delete();
            });
 
            return redirect()->route('zones.index')->with([
                'status'  => true,
                'message' => 'Zone deleted successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to delete zone', [
                'message' => $e->getMessage(),
                'zone_id' => $zone->id,
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to delete zone',
            ]);
        }
    }
}
