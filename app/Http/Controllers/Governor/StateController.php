<?php

namespace App\Http\Controllers\Governor;

use App\Http\Controllers\Controller;
use App\Models\State;
use Illuminate\Http\Request;

class StateController extends Controller
{
    /**
     * A governor only ever has one state — skip the list and go
     * straight to its zones instead of showing a single-row table.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', State::class);

        $state = State::findOrFail($request->user()->location_id);

        return redirect()->route('governor.zones.index', ['state_id' => $state->id]);
    }
}