<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CountdownController extends Controller
{
    public function index(Request $request)
    {
        try {
            /**
             * You can later move this to DB or settings table
             * For now we keep it flexible + safe fallback
             */
            $date = config('app.election_date')
                ? Carbon::parse(config('app.election_date'))->toDateString()
                : null;

            return inertia('dashboard/admin/countdown/Index', [
                'date' => $date,
            ]);

        } catch (\Throwable $e) {

            Log::error('Unable to retrieve countdown date', [
                'message' => $e->getMessage()
            ]);

            return inertia('dashboard/admin/countdown/Index', [
                'date' => null
            ]);
        }
    }
}