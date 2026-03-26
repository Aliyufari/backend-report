<?php

namespace App\Jobs;

use App\Events\UploadProgressUpdated;
use App\Imports\PusImport;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class ProcessPusUpload implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 600;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected string $uploadId,
        protected string $filePath,
        protected string $userId,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->updateProgress('processing', 10, 'Reading file...');

        try {
            $this->updateProgress('processing', 30, 'Importing rows...');

            Excel::import(new PusImport(), Storage::path($this->filePath));

            $this->updateProgress('done', 100, 'Upload complete.');

            // Clean up temp file
            Storage::delete($this->filePath);
        } catch (Throwable $e) {
            $this->updateProgress('failed', 0, 'Upload failed: ' . $e->getMessage());
            Storage::delete($this->filePath);
            throw $e;
        }
    }

    public function failed(Throwable $e): void
    {
        $this->updateProgress('failed', 0, 'Job failed: ' . $e->getMessage());
        Storage::delete($this->filePath);
    }

    // ─────────────────────────────────────────────
    // Store progress in cache (persists across requests)
    // Key: upload_progress_{uploadId}
    // TTL: 24 hours so user can return and still see it
    // ─────────────────────────────────────────────
    protected function updateProgress(string $status, int $percent, string $message): void
    {
        $data = [
            'upload_id' => $this->uploadId,
            'status'    => $status,   // pending | processing | done | failed
            'percent'   => $percent,
            'message'   => $message,
            'updated_at' => now()->toISOString(),
        ];

        Cache::put("upload_progress_{$this->uploadId}", $data, now()->addHours(24));

        // Broadcast to the user's private channel so the frontend updates live
        event(new UploadProgressUpdated($this->userId, $data));
    }
}
