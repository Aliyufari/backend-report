<?php

namespace App\Http\Controllers\Coordinator;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class EoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // $this->authorize('viewAny', Eo::class);
        // $user = $request->user();

        // $eos = Eo::visibleTo($user) // scoped to this coordinator's own state/zone/lga/ward
        //     ->latest()
        //     ->paginate();

        // return Inertia::render('dashboard/coordinator/eos/Index', [
        //     'eos' => $eos,
        // ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
