<?php

namespace App\Services;

use App\Enums\RecordStatus;
use App\Models\Accreditation;
use App\Models\Election;
use App\Models\Lga;
use App\Models\Pu;
use App\Models\State;
use App\Models\Ward;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class AccreditationReportService
{
    /**
     * Resolve selected election.
     */
    public function resolveElectionId(Request $request): ?string
    {
        return $request->election_id
            ?? Election::query()
                ->latest('election_date')
                ->value('id');
    }

    /**
     * Elections dropdown.
     */
    public function elections()
    {
        return Election::query()
            ->orderByDesc('election_date')
            ->get([
                'id',
                'title',
            ]);
    }

    /**
     * Restrict accreditation relationship
     * to a particular election.
     */
    protected function accreditationRelation(?string $electionId): callable
    {
        return function ($query) use ($electionId) {

            if ($electionId) {
                $query->where('election_id', $electionId);
            }

        };
    }

    /**
     * Calculate accreditation statistics.
     */
    protected function buildStatistics(
        Collection $records,
        int $totalPus
    ): array {

        $submitted = $records->count();

        $verified = $records
            ->where('status', RecordStatus::VERIFIED)
            ->count();

        $pending = $records
            ->where('status', RecordStatus::PENDING)
            ->count();

        $flagged = $records
            ->where('status', RecordStatus::FLAGGED)
            ->count();

        return [

            'submitted_pus' => $submitted,

            'pending_pus' => max(
                $totalPus - $submitted,
                0
            ),

            'verified' => $verified,

            'pending' => $pending,

            'flagged' => $flagged,

            'accredited_total' => $records->sum(
                'accredited_voters'
            ),

            'submission_percentage' => $totalPus > 0
                ? round(($submitted / $totalPus) * 100, 1)
                : 0,

        ];
    }

    /**
     * Build a hierarchy statistics array.
     */
    protected function hierarchyStatistics(
        Collection $zones,
        Collection $lgas,
        Collection $wards,
        Collection $pus
    ): array {

        $records = $pus
            ->flatMap
            ->accreditations;

        return [

            'zones_count' => $zones->count(),

            'lgas_count' => $lgas->count(),

            'wards_count' => $wards->count(),

            'pus_count' => $pus->count(),

            ...$this->buildStatistics(
                $records,
                $pus->count()
            ),

        ];
    }

    /**
     * STATE REPORT
     */
    public function stateSummary(?string $electionId): Collection
    {
        return State::query()

            ->with([

                'zones.lgas.wards.pus',

                'zones.lgas.wards.pus.accreditations'
                    => $this->accreditationRelation($electionId),

            ])

            ->orderBy('name')

            ->get()

            ->map(function (State $state) {

                $zones = $state->zones;

                $lgas = $zones
                    ->flatMap
                    ->lgas;

                $wards = $lgas
                    ->flatMap
                    ->wards;

                $pus = $wards
                    ->flatMap
                    ->pus;

                return [

                    'id' => $state->id,

                    'name' => $state->name,

                    ...$this->hierarchyStatistics(
                        $zones,
                        $lgas,
                        $wards,
                        $pus
                    ),

                ];

            });

    }

    /**
     * Zone Summary
     */
    public function zoneSummary(State $state, ?string $electionId): Collection
    {
        return Zone::query()

            ->where('state_id', $state->id)

            ->with([

                'lgas.wards.pus',

                'lgas.wards.pus.accreditations'
                    => $this->accreditationRelation($electionId),

            ])

            ->orderBy('name')

            ->get()

            ->map(function (Zone $zone) {

                $lgas = $zone->lgas;

                $wards = $lgas
                    ->flatMap
                    ->wards;

                $pus = $wards
                    ->flatMap
                    ->pus;

                $records = $pus
                    ->flatMap
                    ->accreditations;

                $stats = $this->buildStatistics(
                    $records,
                    $pus->count()
                );

                return [

                    'id' => $zone->id,

                    'name' => $zone->name,

                    'lgas_count' => $lgas->count(),

                    'wards_count' => $wards->count(),

                    'pus_count' => $pus->count(),

                    'submitted_pus'
                        => $stats['submitted_pus'],

                    'pending_pus'
                        => $stats['pending_pus'],

                    'verified'
                        => $stats['verified'],

                    'pending'
                        => $stats['pending'],

                    'flagged'
                        => $stats['flagged'],

                    'accredited_total'
                        => $stats['accredited_total'],

                    'submission_percentage'
                        => $stats['submission_percentage'],
                ];
            });
    }

    /**
     * LGA Summary
     */
    public function lgaSummary(Zone $zone, ?string $electionId): Collection
    {
        return Lga::query()

            ->where('zone_id', $zone->id)

            ->with([

                'wards.pus',

                'wards.pus.accreditations'
                    => $this->accreditationRelation($electionId),

            ])

            ->orderBy('name')

            ->get()

            ->map(function (Lga $lga) {

                $wards = $lga->wards;

                $pus = $wards
                    ->flatMap
                    ->pus;

                $records = $pus
                    ->flatMap
                    ->accreditations;

                $stats = $this->buildStatistics(
                    $records,
                    $pus->count()
                );

                return [

                    'id' => $lga->id,

                    'name' => $lga->name,

                    'wards_count'
                        => $wards->count(),

                    'pus_count'
                        => $pus->count(),

                    'submitted_pus'
                        => $stats['submitted_pus'],

                    'pending_pus'
                        => $stats['pending_pus'],

                    'verified'
                        => $stats['verified'],

                    'pending'
                        => $stats['pending'],

                    'flagged'
                        => $stats['flagged'],

                    'accredited_total'
                        => $stats['accredited_total'],

                    'submission_percentage'
                        => $stats['submission_percentage'],
                ];
            });
    }

    /**
     * Ward Summary
     */
    public function wardSummary(Lga $lga, ?string $electionId): Collection
    {
        return Ward::query()

            ->where('lga_id', $lga->id)

            ->with([

                'pus',

                'pus.accreditations'
                    => $this->accreditationRelation($electionId),

            ])

            ->orderBy('name')

            ->get()

            ->map(function (Ward $ward) {

                $pus = $ward->pus;

                $records = $pus
                    ->flatMap
                    ->accreditations;

                $stats = $this->buildStatistics(
                    $records,
                    $pus->count()
                );

                return [

                    'id' => $ward->id,

                    'name' => $ward->name,

                    'pus_count'
                        => $pus->count(),

                    'submitted_pus'
                        => $stats['submitted_pus'],

                    'pending_pus'
                        => $stats['pending_pus'],

                    'verified'
                        => $stats['verified'],

                    'pending'
                        => $stats['pending'],

                    'flagged'
                        => $stats['flagged'],

                    'accredited_total'
                        => $stats['accredited_total'],

                    'submission_percentage'
                        => $stats['submission_percentage'],
                ];
            });
    }

    /**
     * Polling Unit Summary
     */
    public function puSummary(Ward $ward, ?string $electionId): Collection
    {
        return Pu::query()
            ->where('ward_id', $ward->id)
            ->with([
                'accreditations' => $this->accreditationRelation($electionId),
            ])
            ->orderBy('name')
            ->get()
            ->map(function (Pu $pu) {

                $record = $pu->accreditations->first();

                return [

                    'id' => $pu->id,

                    'code' => $pu->code,

                    'name' => $pu->name,

                    'accreditation_id' => $record?->id,

                    'accredited_voters' => $record?->accredited_voters ?? 0,

                    'status' => $record?->status?->value ?? null,

                    'image_path' => $record?->image_path,

                    'submitted' => $record !== null,

                ];
            });
    }

    /**
     * Single Polling Unit Report
     */
    public function puReport(Pu $pu, ?string $electionId): array
    {
        $record = Accreditation::query()
            ->where('pu_id', $pu->id)
            ->where('election_id', $electionId)
            ->with('election')
            ->first();

        return [

            'pu' => [

                'id' => $pu->id,

                'name' => $pu->name,

                'code' => $pu->code,

            ],

            'accreditation' => $record,

            'statistics' => [

                'submitted' => $record !== null,

                'accredited_total' => $record?->accredited_voters ?? 0,

                'status' => $record?->status?->value,

            ],

        ];
    }
}