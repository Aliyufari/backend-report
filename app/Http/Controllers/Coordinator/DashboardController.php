<?php

namespace App\Http\Controllers\Coordinator;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('dashboard/coordinator/Index', [
            'locationName' => optional($request->user()->location)->name,
            'locationType' => $request->user()->location_type?->value,
        ]);
    }
}