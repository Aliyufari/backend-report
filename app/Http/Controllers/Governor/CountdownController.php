<?php

namespace App\Http\Controllers\Governor;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CountdownController extends Controller
{
    public function index(Request $request)
    {
        try {
            $date = config('app.election_date')
                ? Carbon::parse(config('app.election_date'))->toDateString()
                : null;

            return inertia('dashboard/governor/countdown/Index', [
                'date' => $date,
            ]);

        } catch (\Throwable $e) {

            Log::error('Unable to retrieve countdown date', [
                'message' => $e->getMessage()
            ]);

            return inertia('dashboard/governor/countdown/Index', [
                'date' => null
            ]);
        }
    }
}