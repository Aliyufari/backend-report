<?php

namespace App\Imports;

use App\Models\Pu;
use App\Models\Lga;
use App\Models\Ward;
use App\Models\Zone;
use App\Models\State;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class PusImport implements ToCollection, WithHeadingRow, WithChunkReading
{

    public function chunkSize(): int
    {
        return 500;
    }

    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            if (
                empty($row['state']) ||
                empty($row['zone'])  ||
                empty($row['lga'])   ||
                empty($row['ra'])    ||
                empty($row['pu'])    ||
                empty($row['delim'])
            ) {
                continue;
            }

            $stateName = Str::title(trim($row['state']));
            $zoneName  = Str::title(trim($row['zone']));
            $lgaName   = Str::title(trim($row['lga']));
            $wardName  = Str::title(trim($row['ra']));
            $puName    = Str::title(trim($row['pu']));
            $puCode  = trim($row['delim']);

            $state = State::firstOrCreate(['name' => $stateName]);
            $zone  = Zone::firstOrCreate(['name' => $zoneName, 'state_id' => $state->id]);
            $lga   = Lga::firstOrCreate(['name'  => $lgaName,  'zone_id'  => $zone->id]);
            $ward  = Ward::firstOrCreate(['name' => $wardName, 'lga_id'   => $lga->id]);

            Pu::updateOrCreate(
                ['code'  => $puCode, 'ward_id' => $ward->id],
                ['name'    => $puName,   'ward_id' => $ward->id]
            );
        }
    }
}
