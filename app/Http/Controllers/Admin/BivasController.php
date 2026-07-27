<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BivasStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBivasRequest;
use App\Http\Requests\Admin\UpdateBivasRequest;
use App\Http\Resources\BivasResource;
use App\Models\Bivas;
use App\Models\State;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BivasController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Bivas::class);
        $user = $request->user();

        try {
            $machines = Bivas::visibleTo($user)
                ->with(['pu.ward.lga.zone.state'])
                ->when($request->search, fn($q, $s) => $q->where('serial_number', 'like', "%{$s}%"))
                ->when($request->status, fn($q, $s) => $q->where('status', $s))
                ->latest()
                ->paginate()
                ->withQueryString();

            $baseQuery = Bivas::visibleTo($user);

            $statistics = [
                'total'       => (clone $baseQuery)->count(),
                'active'      => (clone $baseQuery)->where('status', BivasStatus::ACTIVE)->count(),
                'inactive'    => (clone $baseQuery)->where('status', BivasStatus::INACTIVE)->count(),
                'faulty'      => (clone $baseQuery)->where('status', BivasStatus::FAULTY)->count(),
                'maintenance' => (clone $baseQuery)->where('status', BivasStatus::MAINTENANCE)->count(),
            ];

            return inertia('dashboard/admin/bivas/Index', [
                'machines'      => BivasResource::collection($machines),
                'locations'     => State::with(['zones.lgas.wards.pus'])->orderBy('name')->get()->toArray(),
                'locationScope' => 'state',
                'filters'       => $request->only(['search', 'status']),
                'statuses'      => collect(BivasStatus::cases())->map(fn($s) => ['value' => $s->value, 'label' => ucfirst($s->name)]),
                'statistics'    => $statistics,
                'permissions'   => ['can_create' => $user->can('create', Bivas::class)],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load BIVAS machines', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Unable to load BIVAS machines.']);
        }
    }

    public function store(StoreBivasRequest $request)
    {
        try {
            Bivas::create($request->validated());

            return back()->with(['status' => true, 'message' => 'BIVAS machine registered successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to create BIVAS machine', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Failed to register BIVAS machine. Please try again.']);
        }
    }

    public function update(UpdateBivasRequest $request, Bivas $bivas)
    {
        try {
            $bivas->update($request->validated());

            return back()->with(['status' => true, 'message' => 'BIVAS machine updated successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to update BIVAS machine', ['message' => $e->getMessage(), 'bivas_id' => $bivas->id]);

            return back()->withErrors(['general' => 'Failed to update BIVAS machine. Please try again.']);
        }
    }

    public function destroy(Bivas $bivas)
    {
        $this->authorize('delete', $bivas);

        try {
            $bivas->delete();

            return back()->with(['status' => true, 'message' => 'BIVAS machine removed successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to delete BIVAS machine', ['message' => $e->getMessage(), 'bivas_id' => $bivas->id]);

            return back()->withErrors(['general' => 'Failed to remove BIVAS machine. Please try again.']);
        }
    }
}