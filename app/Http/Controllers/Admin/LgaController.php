<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLgaRequest;
use App\Http\Requests\Admin\UpdateLgaRequest;
use App\Models\Lga;
use App\Models\State;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LgaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Lga::class);
 
            $lgas = Lga::query()
                ->with(['zone.state'])
                ->withCount(['wards', 'users'])
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%");
                })
                ->when($request->filled('zone_id'), function ($q) use ($request) {
                    $q->where('zone_id', $request->zone_id);
                })
                ->when($request->filled('state_id'), function ($q) use ($request) {
                    $q->whereHas('zone', fn($z) => $z->where('state_id', $request->state_id));
                })
                ->latest()
                ->paginate()
                ->withQueryString();
 
            $states = State::with('zones')->orderBy('name')->get();
 
            return inertia('dashboard/admin/locations/lgas/Index', [
                'lgas'    => $lgas,
                'states'  => $states,
                'filters' => $request->only(['search', 'zone_id', 'state_id']),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load LGAs', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => 'Unable to load LGAs',
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLgaRequest $request)
    {
        try {
            $this->authorize('create', Lga::class);
 
            DB::transaction(function () use ($request) {
                Lga::create($request->validated());
            });
 
            return redirect()->route('lgas.index')->with([
                'status'  => true,
                'message' => 'LGA created successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to create LGA', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to create LGA',
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLgaRequest $request, Lga $lga)
    {
        try {
            $this->authorize('update', $lga);
 
            DB::transaction(function () use ($request, $lga) {
                $lga->update($request->validated());
            });
 
            return redirect()->route('lgas.index')->with([
                'status'  => true,
                'message' => 'LGA updated successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update LGA', [
                'message' => $e->getMessage(),
                'lga_id'  => $lga->id,
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to update LGA',
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lga $lga)
    {
        try {
            $this->authorize('delete', $lga);
 
            DB::transaction(function () use ($lga) {
                $lga->delete();
            });
 
            return redirect()->route('lgas.index')->with([
                'status'  => true,
                'message' => 'LGA deleted successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to delete LGA', [
                'message' => $e->getMessage(),
                'lga_id'  => $lga->id,
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to delete LGA',
            ]);
        }
    }
}
