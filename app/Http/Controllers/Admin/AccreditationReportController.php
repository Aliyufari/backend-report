<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Accreditation;
use App\Models\Lga;
use App\Models\Pu;
use App\Models\State;
use App\Models\Ward;
use App\Models\Zone;
use App\Services\AccreditationReportService;
use Illuminate\Http\Request;

class AccreditationReportController extends Controller
{
    public function __construct(
        protected AccreditationReportService $service
    ) {
    }

    /**
     * State Summary
     */
    public function states(Request $request)
    {
        $this->authorize('viewAny', Accreditation::class);

        $electionId = $this->service->resolveElectionId($request);

        return inertia('dashboard/admin/accreditations/report/States', [
            'rows'        => $this->service->stateSummary($electionId),
            'elections'   => $this->service->elections(),
            'electionId'  => $electionId,
        ]);
    }

    /**
     * Zone Summary
     */
    public function zones(Request $request, State $state)
    {
        $this->authorize('viewAny', Accreditation::class);

        $electionId = $this->service->resolveElectionId($request);

        return inertia('dashboard/admin/accreditations/report/Zones', [
            'rows'        => $this->service->zoneSummary($state, $electionId),
            'parent'      => [
                'id'   => $state->id,
                'name' => $state->name,
            ],
            'electionId' => $electionId,
        ]);
    }

    /**
     * LGA Summary
     */
    public function lgas(Request $request, Zone $zone)
    {
        $this->authorize('viewAny', Accreditation::class);

        $electionId = $this->service->resolveElectionId($request);

        return inertia('dashboard/admin/accreditations/report/Lgas', [
            'rows'        => $this->service->lgaSummary($zone, $electionId),
            'parent'      => [
                'id'   => $zone->id,
                'name' => $zone->name,
            ],
            'electionId' => $electionId,
        ]);
    }

    /**
     * Ward Summary
     */
    public function wards(Request $request, Lga $lga)
    {
        $this->authorize('viewAny', Accreditation::class);

        $electionId = $this->service->resolveElectionId($request);

        return inertia('dashboard/admin/accreditations/report/Wards', [
            'rows'        => $this->service->wardSummary($lga, $electionId),
            'parent'      => [
                'id'   => $lga->id,
                'name' => $lga->name,
            ],
            'electionId' => $electionId,
        ]);
    }

    /**
     * Polling Units
     */
    public function pus(Request $request, Ward $ward)
    {
        $this->authorize('viewAny', Accreditation::class);

        $electionId = $this->service->resolveElectionId($request);

        return inertia('dashboard/admin/accreditations/report/Pus', [
            'rows'        => $this->service->puSummary($ward, $electionId),
            'parent'      => [
                'id'   => $ward->id,
                'name' => $ward->name,
            ],
            'electionId' => $electionId,
        ]);
    }

    /**
     * Single Polling Unit Report
     */
    public function show(Request $request, Pu $pu)
    {
        $this->authorize('viewAny', Accreditation::class);

        $electionId = $this->service->resolveElectionId($request);

        return inertia('dashboard/admin/accreditations/report/Pu', array_merge(
            $this->service->puReport($pu, $electionId),
            [
                'electionId' => $electionId,
            ]
        ));
    }
}