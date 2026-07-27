<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStateRequest;
use App\Http\Requests\Admin\UpdateStateRequest;
use App\Models\State;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', State::class);
 
            $states = State::query()
                ->withCount(['zones', 'users'])
                ->when($request->filled('search'), function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%");
                })
                ->latest()
                ->paginate()
                ->withQueryString();
 
            return inertia('dashboard/admin/locations/states/Index', [
                'states'  => $states,
                'filters' => $request->only(['search']),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load states', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => 'Unable to load states',
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStateRequest $request)
    {
        try {
            $this->authorize('create', State::class);
 
            DB::transaction(function () use ($request) {
                State::create($request->validated());
            });
 
            return redirect()->route('states.index')->with([
                'status'  => true,
                'message' => 'State created successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to create state', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to create state',
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStateRequest $request, State $state)
    {
        try {
            $this->authorize('update', $state);
 
            DB::transaction(function () use ($request, $state) {
                $state->update($request->validated());
            });
 
            return redirect()->route('states.index')->with([
                'status'  => true,
                'message' => 'State updated successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update state', [
                'message' => $e->getMessage(),
                'state_id' => $state->id,
                'user_id'  => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to update state',
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(State $state)
    {
        try {
            $this->authorize('delete', $state);
 
            DB::transaction(function () use ($state) {
                $state->delete();
            });
 
            return redirect()->route('states.index')->with([
                'status'  => true,
                'message' => 'State deleted successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to delete state', [
                'message'  => $e->getMessage(),
                'state_id' => $state->id,
                'user_id'  => auth()->id(),
            ]);
 
            return back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to delete state',
            ]);
        }
    }
}
