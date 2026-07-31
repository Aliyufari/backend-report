<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CountdownController extends Controller
{
    public function index(Request $request)
    {
        try {
            /**
             * You can later move this to DB or settings table
             * For now we keep it flexible + safe fallback
             */
            // $date = config('app.election_date')
            //     ? Carbon::parse(config('app.election_date'))->toDateString()
            //     : null;

            return inertia('dashboard/admin/countdown/Index', [
                'date' => Setting::get('election_countdown_date'),
                'label' => Setting::get('election_countdown_label', 'Nigerian 2027 General Election')
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