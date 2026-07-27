<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ElectionStatus;
use App\Enums\ElectionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreElectionRequest;
use App\Http\Requests\Admin\UpdateElectionRequest;
use App\Http\Resources\ElectionResource;
use App\Models\Election;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ElectionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Election::class);
        $user = $request->user();

        try {
            $elections = Election::query()
                ->when($request->search, fn($q, $s) => $q->where('title', 'like', "%{$s}%"))
                ->when($request->status, fn($q, $s) => $q->where('status', $s))
                ->latest('election_date')
                ->paginate()
                ->withQueryString();

            $statistics = [
                'total'     => Election::count(),
                'upcoming'  => Election::where('status', ElectionStatus::UPCOMING)->count(),
                'ongoing'   => Election::where('status', ElectionStatus::ONGOING)->count(),
                'completed' => Election::where('status', ElectionStatus::COMPLETED)->count(),
            ];

            return inertia('dashboard/admin/elections/Index', [
                'elections'   => ElectionResource::collection($elections),
                'filters'     => $request->only(['search', 'status']),
                'statuses'    => collect(ElectionStatus::cases())->map(fn($s) => ['value' => $s->value, 'label' => ucfirst($s->name)]),
                'types'       => collect(ElectionType::cases())->map(fn($t) => ['value' => $t->value, 'label' => $t->label()]),
                'statistics'  => $statistics,
                'permissions' => ['can_create' => $user->can('create', Election::class)],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load elections', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Unable to load elections.']);
        }
    }

    public function store(StoreElectionRequest $request)
    {
        try {
            Election::create($request->validated());

            return back()->with(['status' => true, 'message' => 'Election created successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to create election', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Failed to create election. Please try again.']);
        }
    }

    public function update(UpdateElectionRequest $request, Election $election)
    {
        try {
            $election->update($request->validated());

            return back()->with(['status' => true, 'message' => 'Election updated successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to update election', ['message' => $e->getMessage(), 'election_id' => $election->id]);

            return back()->withErrors(['general' => 'Failed to update election. Please try again.']);
        }
    }

    public function destroy(Election $election)
    {
        $this->authorize('delete', $election);

        try {
            $election->delete();

            return back()->with(['status' => true, 'message' => 'Election removed successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to delete election', ['message' => $e->getMessage(), 'election_id' => $election->id]);

            return back()->withErrors(['general' => 'Failed to remove election. Please try again.']);
        }
    }

    /**
     * Election Readiness — read-only overview of upcoming/ongoing
     * elections and a rough completeness signal per election.
     */
    public function readiness(Request $request)
    {
        $this->authorize('viewAny', Election::class);

        $elections = Election::query()
            ->whereIn('status', [ElectionStatus::UPCOMING, ElectionStatus::ONGOING])
            ->orderBy('election_date')
            ->get();

        return inertia('dashboard/admin/elections/Readiness', [
            'elections' => ElectionResource::collection($elections),
        ]);
    }
}