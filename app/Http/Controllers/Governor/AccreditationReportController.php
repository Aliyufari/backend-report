<?php

namespace App\Http\Controllers\Governor;

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
     * A governor only ever has one state, so redirect straight to it
     * instead of showing a nationwide states list.
     */
    public function states(Request $request)
    {
        $this->authorize('viewAny', Accreditation::class);

        $state = State::findOrFail($request->user()->location_id);
        $electionId = $this->service->resolveElectionId($request);

        return redirect()->route('governor.accreditations.zones', [
            'state'       => $state,
            'election_id' => $electionId,
        ]);
    }

    public function zones(Request $request, State $state)
    {
        $this->authorize('viewAny', Accreditation::class);
        abort_unless($state->id === $request->user()->location_id, 403);

        $electionId = $this->service->resolveElectionId($request);

        return inertia('dashboard/governor/accreditations/report/Zones', [
            'rows'       => $this->service->zoneSummary($state, $electionId),
            'elections'  => $this->service->elections(),
            'parent'     => ['id' => $state->id, 'name' => $state->name],
            'electionId' => $electionId,
        ]);
    }

    public function lgas(Request $request, Zone $zone)
    {
        $this->authorize('viewAny', Accreditation::class);
        abort_unless($zone->state_id === $request->user()->location_id, 403);

        $electionId = $this->service->resolveElectionId($request);

        return inertia('dashboard/governor/accreditations/report/Lgas', [
            'rows'       => $this->service->lgaSummary($zone, $electionId),
            'parent'     => ['id' => $zone->id, 'name' => $zone->name],
            'electionId' => $electionId,
        ]);
    }

    public function wards(Request $request, Lga $lga)
    {
        $this->authorize('viewAny', Accreditation::class);
        abort_unless($lga->zone->state_id === $request->user()->location_id, 403);

        $electionId = $this->service->resolveElectionId($request);

        return inertia('dashboard/governor/accreditations/report/Wards', [
            'rows'       => $this->service->wardSummary($lga, $electionId),
            'parent'     => ['id' => $lga->id, 'name' => $lga->name],
            'electionId' => $electionId,
        ]);
    }

    public function pus(Request $request, Ward $ward)
    {
        $this->authorize('viewAny', Accreditation::class);
        abort_unless($ward->lga->zone->state_id === $request->user()->location_id, 403);

        $electionId = $this->service->resolveElectionId($request);

        return inertia('dashboard/governor/accreditations/report/Pus', [
            'rows'       => $this->service->puSummary($ward, $electionId),
            'parent'     => ['id' => $ward->id, 'name' => $ward->name],
            'electionId' => $electionId,
        ]);
    }

    public function show(Request $request, Pu $pu)
    {
        $this->authorize('viewAny', Accreditation::class);
        abort_unless(
            $pu->ward->lga->zone->state_id === $request->user()->location_id,
            403
        );

        $electionId = $this->service->resolveElectionId($request);

        return inertia('dashboard/governor/accreditations/report/Pu', array_merge(
            $this->service->puReport($pu, $electionId),
            ['electionId' => $electionId]
        ));
    }
}