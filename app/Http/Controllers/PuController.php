<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePuRequest;
use App\Http\Requests\UpdatePuRequest;
use App\Models\Pu;
use App\Models\State;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PuController extends Controller
{
    /**
     * Display a listing of the resource.
     */
        public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Pu::class);
 
            $pus = Pu::query()
                ->with(['ward.lga.zone.state'])
                ->withCount(['users'])
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->where(function ($query) use ($request) {
                        $query->where('name', 'like', "%{$request->search}%")
                              ->orWhere('code', 'like', "%{$request->search}%");
                    });
                })
                ->when($request->filled('ward_id'), function ($q) use ($request) {
                    $q->where('ward_id', $request->ward_id);
                })
                ->when($request->filled('state_id'), function ($q) use ($request) {
                    $q->whereHas('ward.lga.zone', fn($z) => $z->where('state_id', $request->state_id));
                })
                ->latest()
                ->paginate()
                ->withQueryString();
 
            $states = State::with('zones.lgas.wards')->orderBy('name')->get();
 
            return inertia('dashboard/admin/locations/pus/Index', [
                'pus'     => $pus,
                'states'  => $states,
                'filters' => $request->only(['search', 'ward_id', 'state_id']),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load polling units', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => 'Unable to load polling units',
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePuRequest $request)
    {
        try {
            $this->authorize('create', Pu::class);
 
            DB::transaction(function () use ($request) {
                Pu::create($request->validated());
            });
 
            return redirect()->route('pus.index')->with([
                'status'  => true,
                'message' => 'Polling unit created successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to create polling unit', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to create polling unit',
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePuRequest $request, Pu $pu)
    {
        try {
            $this->authorize('update', $pu);
 
            DB::transaction(function () use ($request, $pu) {
                $pu->update($request->validated());
            });
 
            return redirect()->route('pus.index')->with([
                'status'  => true,
                'message' => 'Polling unit updated successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update polling unit', [
                'message' => $e->getMessage(),
                'pu_id'   => $pu->id,
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to update polling unit',
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pu $pu)
    {
        try {
            $this->authorize('delete', $pu);
 
            DB::transaction(function () use ($pu) {
                $pu->delete();
            });
 
            return redirect()->route('pus.index')->with([
                'status'  => true,
                'message' => 'Polling unit deleted successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to delete polling unit', [
                'message' => $e->getMessage(),
                'pu_id'   => $pu->id,
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to delete polling unit',
            ]);
        }
    }
}
