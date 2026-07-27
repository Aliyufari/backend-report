<?php

namespace App\Http\Controllers\Governor;

use App\Enums\BivasStatus;
use App\Enums\CvrStatus;
use App\Http\Controllers\Controller;
use App\Models\Bivas;
use App\Models\Cvr;
use App\Models\Lga;
use App\Models\Pu;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $cvrQuery   = Cvr::visibleTo($user);
        $bivasQuery = Bivas::visibleTo($user);

        $stats = [
            'total_cvrs'      => (clone $cvrQuery)->count(),
            'pending_cvrs'    => (clone $cvrQuery)->where('status', CvrStatus::PENDING)->count(),
            'approved_cvrs'   => (clone $cvrQuery)->where('status', CvrStatus::APPROVED)->count(),
            'rejected_cvrs'   => (clone $cvrQuery)->where('status', CvrStatus::REJECTED)->count(),
            'active_centres'  => Pu::whereHas('ward.lga.zone', fn ($q) => $q->where('state_id', $user->location_id))->count(),
            'active_machines' => (clone $bivasQuery)->where('status', BivasStatus::ACTIVE)->count(),
        ];

        $lgaBreakdown = Lga::query()
            ->whereHas('zone', fn ($q) => $q->where('state_id', $user->location_id))
            ->withCount(['wards as pus_count' => function ($q) {
                $q->join('pus', 'pus.ward_id', '=', 'wards.id');
            }])
            ->get()
            ->map(fn (Lga $lga) => [
                'name'  => $lga->name,
                'count' => Cvr::whereHas('pu.ward', fn ($q) => $q->where('lga_id', $lga->id))->count(),
            ])
            ->sortByDesc('count')
            ->take(6)
            ->values();

        return Inertia::render('dashboard/governor/Index', [
            'stateName' => optional($user->location)->name,
            'stats'     => $stats,
            'lgaData'   => $lgaBreakdown,
        ]);
    }
}