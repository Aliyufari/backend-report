<?php

use App\Http\Controllers\Coordinator\AccreditationController;
use App\Http\Controllers\Coordinator\CountdownController;
use App\Http\Controllers\Coordinator\CvrController;
use App\Http\Controllers\Coordinator\DashboardController;
use App\Http\Controllers\Coordinator\EoController;
use App\Http\Controllers\Coordinator\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:state_coordinator|zonal_coordinator|lga_coordinator|ward_coordinator'])
    ->prefix('coordinator')
    ->name('coordinator.')
    ->group(function () {

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // ── Coordinators (within the acting coordinator's own location) ──
        Route::get('/coordinators', [UserController::class, 'index'])->name('users.index');
        Route::post('/coordinators', [UserController::class, 'store'])->name('users.store');
        Route::put('/coordinators/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/coordinators/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        // ── CVRs (within the acting coordinator's own location) ──────────
        Route::get('/cvrs', [CvrController::class, 'index'])->name('cvrs.index');
        Route::post('/cvrs', [CvrController::class, 'store'])->name('cvrs.store');
        Route::put('/cvrs/{cvr}', [CvrController::class, 'update'])->name('cvrs.update');
        Route::delete('/cvrs/{cvr}', [CvrController::class, 'destroy'])->name('cvrs.destroy');

        // ── Election Countdown (read-only) ────────────────────────────────
        Route::get('/countdown', [CountdownController::class, 'index'])->name('countdown.index');

        // ── My Area EOs (read-only — coordinators monitor, don't manage) ─
        Route::get('/eos', [EoController::class, 'index'])->name('eos.index');

        // ── Accreditations (read-only) ─────────────────────────────────────
        Route::get('/accreditations', [AccreditationController::class, 'index'])->name('accreditations.index');
    });