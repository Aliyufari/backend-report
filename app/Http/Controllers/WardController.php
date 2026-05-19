<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWardRequest;
use App\Http\Requests\UpdateWardRequest;
use App\Models\State;
use App\Models\Ward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
        public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Ward::class);
 
            $wards = Ward::query()
                ->with(['lga.zone.state'])
                ->withCount(['pus', 'users'])
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%");
                })
                ->when($request->filled('lga_id'), function ($q) use ($request) {
                    $q->where('lga_id', $request->lga_id);
                })
                ->when($request->filled('state_id'), function ($q) use ($request) {
                    $q->whereHas('lga.zone', fn($z) => $z->where('state_id', $request->state_id));
                })
                ->latest()
                ->paginate()
                ->withQueryString();
 
            $states = State::with('zones.lgas')->orderBy('name')->get();
 
            return inertia('dashboard/admin/locations/wards/Index', [
                'wards'   => $wards,
                'states'  => $states,
                'filters' => $request->only(['search', 'lga_id', 'state_id']),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load wards', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => 'Unable to load wards',
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWardRequest $request)
    {
        try {
            $this->authorize('create', Ward::class);
 
            DB::transaction(function () use ($request) {
                Ward::create($request->validated());
            });
 
            return redirect()->route('wards.index')->with([
                'status'  => true,
                'message' => 'Ward created successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to create ward', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to create ward',
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWardRequest $request, Ward $ward)
    {
        try {
            $this->authorize('update', $ward);
 
            DB::transaction(function () use ($request, $ward) {
                $ward->update($request->validated());
            });
 
            return redirect()->route('wards.index')->with([
                'status'  => true,
                'message' => 'Ward updated successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update ward', [
                'message' => $e->getMessage(),
                'ward_id' => $ward->id,
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to update ward',
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ward $ward)
    {
        try {
            $this->authorize('delete', $ward);
 
            DB::transaction(function () use ($ward) {
                $ward->delete();
            });
 
            return redirect()->route('wards.index')->with([
                'status'  => true,
                'message' => 'Ward deleted successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to delete ward', [
                'message' => $e->getMessage(),
                'ward_id' => $ward->id,
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to delete ward',
            ]);
        }
    }
}
