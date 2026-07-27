<?php

namespace App\Http\Controllers\Coordinator;

use App\Enums\CvrStatus;
use App\Enums\CvrType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Coordinator\StoreCvrRequest;
use App\Http\Requests\Coordinator\UpdateCvrRequest;
use App\Http\Resources\CvrResource;
use App\Models\Cvr;
use App\Traits\ScopesOwnLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CvrController extends Controller
{
    use ScopesOwnLocation;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Cvr::class);
        $user = $request->user();

        try {
            $cvrs = Cvr::visibleTo($user)
                ->with(['pu.ward.lga.zone.state'])
                ->when($request->search, fn($q, $s) => $q->where('unique_id', 'like', "%{$s}%"))
                ->when($request->type, fn($q, $t) => $q->where('type', $t))
                ->when($request->status, fn($q, $s) => $q->where('status', $s))
                ->latest()
                ->paginate()
                ->withQueryString();

            $baseQuery = Cvr::visibleTo($user);

            $statistics = [
                'total'    => (clone $baseQuery)->count(),
                'pending'  => (clone $baseQuery)->where('status', CvrStatus::PENDING)->count(),
                'approved' => (clone $baseQuery)->where('status', CvrStatus::APPROVED)->count(),
                'rejected' => (clone $baseQuery)->where('status', CvrStatus::REJECTED)->count(),
            ];

            return inertia('dashboard/coordinator/cvrs/Index', [
                'cvrs'          => CvrResource::collection($cvrs),
                'locations'     => $this->buildLocations($user),
                'locationScope' => $this->locationScope($user),
                'filters'       => $request->only(['search', 'type', 'status']),
                'types'         => collect(CvrType::cases())->map(fn($t) => ['value' => $t->value, 'label' => $t->name]),
                'statuses'      => collect(CvrStatus::cases())->map(fn($s) => ['value' => $s->value, 'label' => $s->name]),
                'statistics'    => $statistics,
                'permissions'   => ['can_create' => $user->can('create', Cvr::class)],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load CVRs', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Unable to load CVR records.']);
        }
    }

    public function store(StoreCvrRequest $request)
    {
        try {
            Cvr::create([...$request->validated(), 'status' => CvrStatus::PENDING->value]);

            return back()->with(['status' => true, 'message' => 'CVR record created successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to create CVR', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Failed to create CVR record. Please try again.']);
        }
    }

    public function update(UpdateCvrRequest $request, Cvr $cvr)
    {
        try {
            $cvr->update($request->validated());

            return back()->with(['status' => true, 'message' => 'CVR record updated successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to update CVR', ['message' => $e->getMessage(), 'cvr_id' => $cvr->id]);

            return back()->withErrors(['general' => 'Failed to update CVR record. Please try again.']);
        }
    }

    public function destroy(Cvr $cvr)
    {
        $this->authorize('delete', $cvr);

        try {
            $cvr->delete();

            return back()->with(['status' => true, 'message' => 'CVR record deleted successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to delete CVR', ['message' => $e->getMessage(), 'cvr_id' => $cvr->id]);

            return back()->withErrors(['general' => 'Failed to delete CVR record. Please try again.']);
        }
    }
}