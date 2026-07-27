<?php

namespace App\Services;

use App\Enums\CvrStatus;
use App\Models\Cvr;
use App\Models\Lga;
use App\Models\Pu;
use App\Models\State;
use App\Models\Ward;
use App\Models\Zone;
use Illuminate\Support\Collection;

class CvrReportService
{
    /**
     * Per-status breakdown + PU coverage for a set of CVR records.
     */
    protected function buildStatistics(Collection $records, int $totalPus): array
    {
        $pending  = $records->where('status', CvrStatus::PENDING)->count();
        $approved = $records->where('status', CvrStatus::APPROVED)->count();
        $rejected = $records->where('status', CvrStatus::REJECTED)->count();

        $pusWithCvr = $records->pluck('pu_id')->unique()->count();

        return [
            'total_cvrs'   => $records->count(),
            'pending'      => $pending,
            'approved'     => $approved,
            'rejected'     => $rejected,
            'pus_with_cvr' => $pusWithCvr,
            'pus_without_cvr' => max($totalPus - $pusWithCvr, 0),
            'coverage_percentage' => $totalPus > 0
                ? round(($pusWithCvr / $totalPus) * 100, 1)
                : 0,
        ];
    }

    /**
     * STATE SUMMARY
     */
    public function stateSummary(): Collection
    {
        return State::query()
            ->with(['zones.lgas.wards.pus.cvrs'])
            ->orderBy('name')
            ->get()
            ->map(function (State $state) {
                $zones = $state->zones;
                $lgas  = $zones->flatMap->lgas;
                $wards = $lgas->flatMap->wards;
                $pus   = $wards->flatMap->pus;
                $records = $pus->flatMap->cvrs;

                return [
                    'id'   => $state->id,
                    'name' => $state->name,
                    'zones_count' => $zones->count(),
                    'lgas_count'  => $lgas->count(),
                    'wards_count' => $wards->count(),
                    'pus_count'   => $pus->count(),
                    ...$this->buildStatistics($records, $pus->count()),
                ];
            });
    }

    /**
     * ZONE SUMMARY
     */
    public function zoneSummary(State $state): Collection
    {
        return Zone::query()
            ->where('state_id', $state->id)
            ->with(['lgas.wards.pus.cvrs'])
            ->orderBy('name')
            ->get()
            ->map(function (Zone $zone) {
                $lgas  = $zone->lgas;
                $wards = $lgas->flatMap->wards;
                $pus   = $wards->flatMap->pus;
                $records = $pus->flatMap->cvrs;

                return [
                    'id'   => $zone->id,
                    'name' => $zone->name,
                    'lgas_count'  => $lgas->count(),
                    'wards_count' => $wards->count(),
                    'pus_count'   => $pus->count(),
                    ...$this->buildStatistics($records, $pus->count()),
                ];
            });
    }

    /**
     * LGA SUMMARY
     */
    public function lgaSummary(Zone $zone): Collection
    {
        return Lga::query()
            ->where('zone_id', $zone->id)
            ->with(['wards.pus.cvrs'])
            ->orderBy('name')
            ->get()
            ->map(function (Lga $lga) {
                $wards = $lga->wards;
                $pus   = $wards->flatMap->pus;
                $records = $pus->flatMap->cvrs;

                return [
                    'id'   => $lga->id,
                    'name' => $lga->name,
                    'wards_count' => $wards->count(),
                    'pus_count'   => $pus->count(),
                    ...$this->buildStatistics($records, $pus->count()),
                ];
            });
    }

    /**
     * WARD SUMMARY
     */
    public function wardSummary(Lga $lga): Collection
    {
        return Ward::query()
            ->where('lga_id', $lga->id)
            ->with(['pus.cvrs'])
            ->orderBy('name')
            ->get()
            ->map(function (Ward $ward) {
                $pus = $ward->pus;
                $records = $pus->flatMap->cvrs;

                return [
                    'id'   => $ward->id,
                    'name' => $ward->name,
                    'pus_count' => $pus->count(),
                    ...$this->buildStatistics($records, $pus->count()),
                ];
            });
    }

    /**
     * POLLING UNIT SUMMARY — one row per PU, with its CVR count/breakdown.
     */
    public function puSummary(Ward $ward): Collection
    {
        return Pu::query()
            ->where('ward_id', $ward->id)
            ->with('cvrs')
            ->orderBy('name')
            ->get()
            ->map(function (Pu $pu) {
                $records = $pu->cvrs;

                return [
                    'id'   => $pu->id,
                    'code' => $pu->code,
                    'name' => $pu->name,
                    'total_cvrs' => $records->count(),
                    'pending'    => $records->where('status', CvrStatus::PENDING)->count(),
                    'approved'   => $records->where('status', CvrStatus::APPROVED)->count(),
                    'rejected'   => $records->where('status', CvrStatus::REJECTED)->count(),
                    'has_cvr'    => $records->isNotEmpty(),
                ];
            });
    }

    /**
     * All CVR records for a single polling unit — final level, since a PU
     * can have multiple CVR entries (unlike Accreditation's one-per-election).
     */
    public function puCvrs(Pu $pu): array
    {
        $records = Cvr::query()
            ->where('pu_id', $pu->id)
            ->latest()
            ->get();

        return [
            'pu' => [
                'id'   => $pu->id,
                'name' => $pu->name,
                'code' => $pu->code,
            ],
            'records' => $records, 
            'statistics' => [
                'total'    => $records->count(),
                'pending'  => $records->where('status', CvrStatus::PENDING)->count(),
                'approved' => $records->where('status', CvrStatus::APPROVED)->count(),
                'rejected' => $records->where('status', CvrStatus::REJECTED)->count(),
            ],
        ];
    }
}