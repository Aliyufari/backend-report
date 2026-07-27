<?php

namespace App\Http\Controllers\Governor;

use App\Enums\BivasStatus;
use App\Http\Controllers\Controller;
use App\Models\Bivas;
use Illuminate\Http\Request;

class BivasController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Bivas::class);
        $user = $request->user();

        $machines = Bivas::visibleTo($user)
            ->with(['pu.ward.lga.zone.state'])
            ->when($request->search, fn ($q, $s) => $q->where('serial_number', 'like', "%{$s}%"))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate()
            ->withQueryString();

        $baseQuery = Bivas::visibleTo($user);

        return inertia('dashboard/governor/bivas/Index', [
            'machines'   => $machines,
            'filters'    => $request->only(['search', 'status']),
            'statuses'   => collect(BivasStatus::cases())->map(fn ($s) => ['value' => $s->value, 'label' => ucfirst($s->name)]),
            'statistics' => [
                'total'       => (clone $baseQuery)->count(),
                'active'      => (clone $baseQuery)->where('status', BivasStatus::ACTIVE)->count(),
                'inactive'    => (clone $baseQuery)->where('status', BivasStatus::INACTIVE)->count(),
                'faulty'      => (clone $baseQuery)->where('status', BivasStatus::FAULTY)->count(),
                'maintenance' => (clone $baseQuery)->where('status', BivasStatus::MAINTENANCE)->count(),
            ],
        ]);
    }
}