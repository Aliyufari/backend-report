<?php

namespace App\Imports;

use App\Models\Pu;
use App\Models\Lga;
use App\Models\Ward;
use App\Models\Zone;
use App\Models\State;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use App\Events\UploadProgressUpdated;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class PusImport implements ToCollection, WithHeadingRow, WithChunkReading
{
    protected int $chunkIndex = 0;

    public function __construct(
        protected string $uploadId,
        protected string $userId,
        protected int $estimatedTotal = 0,
    ) {}

    public function chunkSize(): int
    {
        return 100;
    }

    public function collection(Collection $rows): void
    {
        $this->chunkIndex++;

        $processedRows = Cache::get("upload_processed_rows_{$this->uploadId}", 0);

        foreach ($rows as $row) {
            if (
                empty($row['state']) ||
                empty($row['zone']) ||
                empty($row['lga']) ||
                empty($row['ra']) ||
                empty($row['pu']) ||
                empty($row['delim'])
            ) {
                continue;
            }

            $stateName = Str::title(trim($row['state']));
            $zoneName  = Str::title(trim($row['zone']));
            $lgaName   = Str::title(trim($row['lga']));
            $wardName  = Str::title(trim($row['ra']));
            $puName    = Str::title(trim($row['pu']));
            $puCode    = trim($row['delim']);

            $state = State::firstOrCreate(['name' => $stateName]);

            $zone = Zone::firstOrCreate([
                'name' => $zoneName,
                'state_id' => $state->id,
            ]);

            $lga = Lga::firstOrCreate([
                'name' => $lgaName,
                'zone_id' => $zone->id,
            ]);

            $ward = Ward::firstOrCreate([
                'name' => $wardName,
                'lga_id' => $lga->id,
            ]);

            Pu::updateOrCreate(
                [
                    'code' => $puCode,
                    'ward_id' => $ward->id,
                ],
                [
                    'name' => $puName,
                ]
            );

            $processedRows++;
        }

        Cache::put(
            "upload_processed_rows_{$this->uploadId}",
            $processedRows,
            now()->addHours(24)
        );

        $percent = $this->estimatedTotal > 0
            ? min(90, (int)(($processedRows / $this->estimatedTotal) * 80) + 10)
            : min(90, $this->chunkIndex * 15 + 10);

        $this->broadcastProgress(
            'processing',
            $percent,
            "Processed {$processedRows} of {$this->estimatedTotal} rows..."
        );
    }

    protected function broadcastProgress(string $status, int $percent, string $message): void
    {
        $existing = Cache::get("upload_progress_{$this->uploadId}");

        if ($existing && in_array($existing['status'], ['done', 'failed'])) {
            return;
        }

        $data = [
            'upload_id' => $this->uploadId,
            'status' => $status,
            'percent' => $percent,
            'message' => $message,
            'updated_at' => now()->toISOString(),
        ];

        Cache::put("upload_progress_{$this->uploadId}", $data, now()->addHours(24));

        event(new UploadProgressUpdated($this->userId, $data));
    }
}
