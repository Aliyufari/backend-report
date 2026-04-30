<?php

namespace App\Jobs;

use Throwable;
use App\Imports\PusImport;
use Illuminate\Bus\Queueable;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Cache;
use App\Events\UploadProgressUpdated;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ProcessPusUpload implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 600;

    public function __construct(
        protected string $uploadId,
        protected string $filePath,
        protected string $userId,
    ) {}

    public function handle(): void
    {
        Cache::forget("upload_processed_rows_{$this->uploadId}");

        try {
            // Initial queued state
            $this->updateProgress('pending', 0, 'Queued for processing...');

            // Reading file
            $this->updateProgress('processing', 5, 'Reading file...');

            // Count rows first for proper percentage
            $estimatedTotal = $this->countRows();

            // Start import
            $this->updateProgress('processing', 10, 'Starting import...');

            Excel::import(
                new PusImport(
                    $this->uploadId,
                    $this->userId,
                    $estimatedTotal
                ),
                Storage::path($this->filePath)
            );

            // Final completion
            $this->updateProgress('done', 100, 'Upload complete.');

            Storage::delete($this->filePath);
        } catch (Throwable $e) {
            $this->updateProgress(
                'failed',
                0,
                'Upload failed: ' . $e->getMessage()
            );

            Storage::delete($this->filePath);

            throw $e;
        }
    }

    public function failed(Throwable $e): void
    {
        $this->updateProgress(
            'failed',
            0,
            'Job failed: ' . $e->getMessage()
        );

        Storage::delete($this->filePath);
    }

    protected function countRows(): int
    {
        try {
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load(
                Storage::path($this->filePath)
            );

            // Remove heading row
            return max(
                0,
                $spreadsheet->getActiveSheet()->getHighestRow() - 1
            );
        } catch (Throwable) {
            // Fallback if count fails
            return 0;
        }
    }

    protected function updateProgress(
        string $status,
        int $percent,
        string $message
    ): void {
        // Prevent stale progress from overwriting newer progress
        $existing = Cache::get("upload_progress_{$this->uploadId}");

        if (
            $existing &&
            isset($existing['updated_at']) &&
            strtotime($existing['updated_at']) > now()->timestamp
        ) {
            return;
        }

        $data = [
            'upload_id' => $this->uploadId,
            'status' => $status,
            'percent' => max(0, min(100, $percent)),
            'message' => $message,
            'updated_at' => now()->toISOString(),
        ];

        Cache::put(
            "upload_progress_{$this->uploadId}",
            $data,
            now()->addHours(24)
        );

        event(
            new UploadProgressUpdated(
                $this->userId,
                $data
            )
        );
    }
}
