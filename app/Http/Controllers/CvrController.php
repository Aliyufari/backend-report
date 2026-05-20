<?php

namespace App\Http\Controllers;

use App\Enums\CvrStatus;
use App\Enums\CvrType;
use App\Http\Requests\StoreCvrRequest;
use App\Http\Requests\UpdateCvrRequest;
use App\Http\Resources\CvrResource;
use App\Models\Cvr;
use App\Models\State;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CvrController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Cvr::class);
            $user = auth()->user();

            $cvrs = Cvr::visibleTo($user)
                ->with(['pu.ward.lga.zone.state'])
                ->when(
                    $request->search,
                    fn($q, $s) =>
                    $q->where('unique_id', 'like', "%{$s}%")
                )
                ->when(
                    $request->type,
                    fn($q, $t) =>
                    $q->where('type', $t)
                )
                ->when(
                    $request->status,
                    fn($q, $s) =>
                    $q->where('status', $s)
                )
                ->latest()
                ->paginate()
                ->withQueryString();

            $state = State::with(['zones.lgas.wards.pus'])
                ->orderBy('name')
                ->get();

            $baseQuery = Cvr::visibleTo($user);

            $statistics = [
                'total' => (clone $baseQuery)->count(),
                'pending' => (clone $baseQuery)->where('status', CvrStatus::PENDING)->count(),
                'approved' => (clone $baseQuery)->where('status', CvrStatus::APPROVED)->count(),
                'rejected' => (clone $baseQuery)->where('status', CvrStatus::REJECTED)->count(),
            ];

            return inertia('dashboard/admin/cvrs/Index', [
                'cvrs'     => CvrResource::collection($cvrs),
                'state'    => $state,
                'filters'  => $request->only(['search', 'type', 'status']),
                'types'    => collect(CvrType::cases())->map(fn($t) => [
                    'value' => $t->value,
                    'label' => $t->name,
                ]),
                'statuses' => collect(CvrStatus::cases())->map(fn($s) => [
                    'value' => $s->value,
                    'label' => $s->name,
                ]),

                'statistics' => $statistics,

                'permissions' => [
                    'can_create' => $user->can('create', Cvr::class)
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load CVRs', ['message' => $e->getMessage()]);

            return back()->with([
                'status' => false,
                'message' => 'Unable to load CVR records'
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCvrRequest $request)
    {
        try {
            $this->authorize('create', Cvr::class);

            Cvr::create([
                ...$request->validated(),
                'status' => CvrStatus::PENDING->value,
            ]);

            return back()->with([
                'status' => true,
                'message' => 'CVR record created successfully.'
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to create CVR', ['message' => $e->getMessage()]);

            return back()->with([
                'status' => false,
                'message' => 'Failed to create CVR record.'
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Cvr $cvr)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCvrRequest $request, Cvr $cvr)
    {
        try {
            $this->authorize('update', $cvr);

            $cvr->update($request->validated());

            return back()->with([
                'status' => true,
                'message' => 'CVR record updated successfully.'
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update CVR', ['message' => $e->getMessage(), 'cvr_id' => $cvr->id]);

            return back()->with([
                'status' => false,
                'message' => 'Failed to update CVR record.'
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cvr $cvr)
    {
        try {
            $this->authorize('delete', $cvr);

            $cvr->delete();

            return back()->with([
                'status' => true,
                'message' => 'CVR record deleted successfully.'
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to delete CVR', ['message' => $e->getMessage(), 'cvr_id' => $cvr->id]);

            return back()->with([
                'status' => false,
                'message' => 'Failed to delete CVR record.'
            ]);
        }
    }
}
