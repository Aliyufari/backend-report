<?php

namespace Database\Seeders;

use App\Enums\ElectionStatus;
use App\Enums\ElectionType;
use App\Models\Election;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ElectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $elections = [
            [
                'title'         => '2027 General Presidential Election',
                'type'          => ElectionType::PRESIDENTIAL,
                'election_date' => Carbon::parse('2027-02-20'),
                'status'        => ElectionStatus::UPCOMING,
            ],
            [
                'title'         => '2027 National Assembly Election',
                'type'          => ElectionType::NATIONAL_ASSEMBLY,
                'election_date' => Carbon::parse('2027-02-20'),
                'status'        => ElectionStatus::UPCOMING,
            ],
            [
                'title'         => '2027 Gubernatorial Election',
                'type'          => ElectionType::GUBERNATORIAL,
                'election_date' => Carbon::parse('2027-03-06'),
                'status'        => ElectionStatus::UPCOMING,
            ],
            [
                'title'         => '2027 State House of Assembly Election',
                'type'          => ElectionType::STATE_ASSEMBLY,
                'election_date' => Carbon::parse('2027-03-06'),
                'status'        => ElectionStatus::UPCOMING,
            ],
            [
                'title'         => '2026 Ongoing Special Election',
                'type'          => ElectionType::BYE_ELECTION,
                'election_date' => Carbon::today(),
                'status'        => ElectionStatus::ONGOING,
            ],
            [
                'title'         => '2026 FCT Local Government Election',
                'type'          => ElectionType::LOCAL_GOVERNMENT,
                'election_date' => Carbon::parse('2026-02-12'),
                'status'        => ElectionStatus::COMPLETED,
            ],
            [
                'title'         => '2024 Constitutional Reform Referendum',
                'type'          => ElectionType::REFERENDUM,
                'election_date' => Carbon::parse('2024-09-10'),
                'status'        => ElectionStatus::COMPLETED,
            ],
        ];

        foreach ($elections as $electionData) {
            Election::updateOrCreate(
                [
                    'title' => $electionData['title'],
                ],
                [
                    'type'          => $electionData['type'],
                    'election_date' => $electionData['election_date'],
                    'status'        => $electionData['status'],
                ]
            );
        }
    }
}