<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cvr;
use App\Models\Lga;
use App\Models\Pu;
use App\Models\State;
use App\Models\Ward;
use App\Models\Zone;
use App\Services\CvrReportService;
use Illuminate\Http\Request;

class CvrReportController extends Controller
{
    public function __construct(
        protected CvrReportService $service
    ) {
    }

    public function states(Request $request)
    {
        $this->authorize('viewAny', Cvr::class);

        return inertia('dashboard/admin/cvrs/report/States', [
            'rows' => $this->service->stateSummary(),
        ]);
    }

    public function zones(Request $request, State $state)
    {
        $this->authorize('viewAny', Cvr::class);

        return inertia('dashboard/admin/cvrs/report/Zones', [
            'rows'   => $this->service->zoneSummary($state),
            'parent' => ['id' => $state->id, 'name' => $state->name],
        ]);
    }

    public function lgas(Request $request, Zone $zone)
    {
        $this->authorize('viewAny', Cvr::class);

        return inertia('dashboard/admin/cvrs/report/Lgas', [
            'rows'   => $this->service->lgaSummary($zone),
            'parent' => ['id' => $zone->id, 'name' => $zone->name],
        ]);
    }

    public function wards(Request $request, Lga $lga)
    {
        $this->authorize('viewAny', Cvr::class);

        return inertia('dashboard/admin/cvrs/report/Wards', [
            'rows'   => $this->service->wardSummary($lga),
            'parent' => ['id' => $lga->id, 'name' => $lga->name],
        ]);
    }

    public function pus(Request $request, Ward $ward)
    {
        $this->authorize('viewAny', Cvr::class);

        return inertia('dashboard/admin/cvrs/report/Pus', [
            'rows'   => $this->service->puSummary($ward),
            'parent' => ['id' => $ward->id, 'name' => $ward->name],
        ]);
    }

    public function show(Request $request, Pu $pu)
    {
        $this->authorize('viewAny', Cvr::class);

        return inertia('dashboard/admin/cvrs/report/Pu', $this->service->puCvrs($pu));
    }
}