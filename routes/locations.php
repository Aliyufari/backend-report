<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LgaController;
use App\Http\Controllers\PuController;
use App\Http\Controllers\StateController;
use App\Http\Controllers\WardController;
use App\Http\Controllers\ZoneController;

Route::middleware(['auth', 'role:super_admin|admin'])->prefix('admin')->group(function () {

    Route::resource('states', StateController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('zones', ZoneController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('lgas', LgaController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('wards', WardController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('pus', PuController::class)
        ->only(['index', 'store', 'update', 'destroy']);
});