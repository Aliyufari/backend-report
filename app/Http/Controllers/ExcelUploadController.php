<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessPusUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ExcelUploadController extends Controller
{
    /**
     * Show the upload page.
     * Pass any existing in-progress upload back to the frontend
     * so the progress bar restores on page revisit.
     */
    public function index(Request $request): Response
    {
        $userId   = $request->user()->id;
        $uploadId = $request->user()->latest_upload_id;

        $progress = $uploadId
            ? Cache::get("upload_progress_{$uploadId}")
            : null;

        return Inertia::render('dashboard/admin/upload/Index', [
            'existingProgress' => $progress,
        ]);
    }

    /**
     * Accept the file, store it, dispatch the job, return uploadId.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:51200'], // 50MB
        ]);

        $uploadId = (string) Str::uuid();
        $path     = $request->file('file')->store('uploads/pus');

        // Store initial progress so frontend can poll/subscribe immediately
        Cache::put("upload_progress_{$uploadId}", [
            'upload_id'  => $uploadId,
            'status'     => 'pending',
            'percent'    => 0,
            'message'    => 'Queued for processing...',
            'updated_at' => now()->toISOString(),
        ], now()->addHours(24));

        // Optionally save uploadId on user so they can restore on revisit
        $request->user()->update(['latest_upload_id' => $uploadId]);

        ProcessPusUpload::dispatch($uploadId, $path, $request->user()->id);

        return response()->json(['upload_id' => $uploadId]);
    }

    /**
     * Polling endpoint — fallback if WebSockets aren't available.
     */
    public function progress(Request $request, string $uploadId): JsonResponse
    {
        $progress = Cache::get("upload_progress_{$uploadId}");

        if (!$progress) {
            return response()->json(['error' => 'Upload not found'], 404);
        }

        return response()->json($progress);
    }
}
