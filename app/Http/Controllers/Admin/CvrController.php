<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CvrStatus;
use App\Enums\CvrType;
use App\Enums\Location;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCvrRequest;
use App\Http\Requests\Admin\UpdateCvrRequest;
use App\Http\Resources\CvrResource;
use App\Models\Cvr;
use App\Models\Lga;
use App\Models\State;
use App\Models\User;
use App\Models\Ward;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CvrController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Cvr::class);

        $user = $request->user();

        try {
            $cvrs = Cvr::visibleTo($user)
                ->with(['pu.ward.lga.zone.state'])
                ->when($request->search, fn ($q, $search) => $q->where('unique_id', 'like', "%{$search}%"))
                ->when($request->type, fn ($q, $type) => $q->where('type', $type))
                ->when($request->status, fn ($q, $status) => $q->where('status', $status))
                ->latest()
                ->paginate()
                ->withQueryString();

            $query = Cvr::visibleTo($user);

            return inertia('dashboard/admin/cvrs/manage/Index', [
                'cvrs' => CvrResource::collection($cvrs),

                'locations'     => $this->buildLocations($user),
                'locationScope' => $this->locationScope($user),

                'filters' => $request->only([
                    'search',
                    'type',
                    'status',
                ]),

                'types' => collect(CvrType::cases())->map(fn ($type) => [
                    'value' => $type->value,
                    'label' => $type->name,
                ]),

                'statuses' => collect(CvrStatus::cases())->map(fn ($status) => [
                    'value' => $status->value,
                    'label' => $status->name,
                ]),

                'statistics' => [
                    'total' => (clone $query)->count(),
                    'pending' => (clone $query)
                        ->where('status', CvrStatus::PENDING)
                        ->count(),

                    'approved' => (clone $query)
                        ->where('status', CvrStatus::APPROVED)
                        ->count(),

                    'rejected' => (clone $query)
                        ->where('status', CvrStatus::REJECTED)
                        ->count(),
                ],

                'permissions' => [
                    'can_create' => $user->can('create', Cvr::class),
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load CVRs', [
                'message' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'general' => 'Unable to load CVR records.',
            ]);
        }
    }

    public function store(StoreCvrRequest $request)
    {
        try {
            Cvr::create([
                ...$request->validated(),
                'status' => CvrStatus::PENDING->value,
            ]);

            return back()->with([
                'status' => true,
                'message' => 'CVR record created successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to create CVR', [
                'message' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'general' => 'Failed to create CVR record. Please try again.',
            ]);
        }
    }

    public function show(Cvr $cvr)
    {
        //
    }

    public function update(UpdateCvrRequest $request, Cvr $cvr)
    {
        try {
            $cvr->update($request->validated());

            return back()->with([
                'status' => true,
                'message' => 'CVR record updated successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update CVR', [
                'message' => $e->getMessage(),
                'cvr_id' => $cvr->id,
            ]);

            return back()->withErrors([
                'general' => 'Failed to update CVR record. Please try again.',
            ]);
        }
    }

    public function destroy(Cvr $cvr)
    {
        $this->authorize('delete', $cvr);

        try {
            $cvr->delete();

            return back()->with([
                'status' => true,
                'message' => 'CVR record deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to delete CVR', [
                'message' => $e->getMessage(),
                'cvr_id' => $cvr->id,
            ]);

            return back()->withErrors([
                'general' => 'Failed to delete CVR record. Please try again.',
            ]);
        }
    }

    /**
     * Return only the locations the authenticated user is allowed to manage.
     */
    private function buildLocations(User $user): array
    {
        if ($user->hasRole(Role::SUPER_ADMIN->value)) {
            return State::with('zones.lgas.wards.pus')
                ->orderBy('name')
                ->get()
                ->toArray();
        }

        if ($user->hasRole(Role::ADMIN->value)) {
            return State::with('zones.lgas.wards.pus')
                ->orderBy('name')
                ->get()
                ->toArray();
        }

        return match ($user->location_type?->value) {
            Location::STATE->value =>
                State::with('zones.lgas.wards.pus')
                    ->whereKey($user->location_id)
                    ->get()
                    ->toArray(),

            Location::ZONE->value =>
                Zone::with('lgas.wards.pus')
                    ->whereKey($user->location_id)
                    ->get()
                    ->toArray(),

            Location::LGA->value =>
                Lga::with('wards.pus')
                    ->whereKey($user->location_id)
                    ->get()
                    ->toArray(),

            Location::WARD->value =>
                Ward::with('pus')
                    ->whereKey($user->location_id)
                    ->get()
                    ->toArray(),

            default => [],
        };
    }

    /**
     * Tell the frontend which level the current user starts from.
     */
    private function locationScope(User $user): string
    {
        if ($user->hasRole(Role::SUPER_ADMIN->value)) {
            return Location::STATE->value;
        }

        if ($user->hasRole(Role::ADMIN->value)) {
            return Location::STATE->value;
        }

        return $user->location_type?->value ?? Location::STATE->value;
    }
}