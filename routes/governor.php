<?php

use App\Http\Controllers\Governor\StateController;
use App\Http\Controllers\Governor\AccreditationReportController;
use App\Http\Controllers\Governor\BivasController;
use App\Http\Controllers\Governor\CountdownController;
use App\Http\Controllers\Governor\CvrReportController;
use App\Http\Controllers\Governor\DashboardController;
use App\Http\Controllers\Governor\EoController;
use App\Http\Controllers\Governor\LgaController;
use App\Http\Controllers\Governor\PuController;
use App\Http\Controllers\Governor\UserController;
use App\Http\Controllers\Governor\WardController;
use App\Http\Controllers\Governor\ZoneController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:governor'])
    ->prefix('governor')
    ->name('governor.')
    ->group(function () {

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // ── Coordinators (within the governor's own state) ────────────────
        Route::get('/coordinators', [UserController::class, 'index'])->name('users.index');
        Route::post('/coordinators', [UserController::class, 'store'])->name('users.store');
        Route::put('/coordinators/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/coordinators/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        // ── Election Countdown (read-only) ─────────────────────────────────
        Route::get('/countdown', [CountdownController::class, 'index'])->name('countdown.index');

        // ── State EOs (read-only — governors monitor, don't manage) ───────
        Route::get('/eos', [EoController::class, 'index'])->name('eos.index');

        // ── CVR hierarchy report (scoped to governor's state) ─────────────
        Route::prefix('cvrs-report')->name('cvrs-report.')->group(function () {
            Route::get('/', [CvrReportController::class, 'states'])->name('index');
            Route::get('/states/{state}/zones', [CvrReportController::class, 'zones'])->name('zones');
            Route::get('/zones/{zone}/lgas', [CvrReportController::class, 'lgas'])->name('lgas');
            Route::get('/lgas/{lga}/wards', [CvrReportController::class, 'wards'])->name('wards');
            Route::get('/wards/{ward}/pus', [CvrReportController::class, 'pus'])->name('pus');
            Route::get('/pus/{pu}', [CvrReportController::class, 'show'])->name('pu');
        });

        // ── Accreditation drill-down report (scoped to governor's state) ──
        Route::prefix('accreditations')->name('accreditations.')->group(function () {
            Route::get('/', [AccreditationReportController::class, 'states'])->name('index');
            Route::get('/states/{state}/zones', [AccreditationReportController::class, 'zones'])->name('zones');
            Route::get('/zones/{zone}/lgas', [AccreditationReportController::class, 'lgas'])->name('lgas');
            Route::get('/lgas/{lga}/wards', [AccreditationReportController::class, 'wards'])->name('wards');
            Route::get('/wards/{ward}/pus', [AccreditationReportController::class, 'pus'])->name('pus');
            Route::get('/pus/{pu}', [AccreditationReportController::class, 'show'])->name('pu');
        });

        // ── BIVAS Machines (read-only — governors monitor, don't manage) ──
        Route::get('/bivas', [BivasController::class, 'index'])->name('bivas.index');

        // ── Location hierarchy (read-only, scoped to governor's own state) ────
        Route::get('/states', [StateController::class, 'index'])->name('states.index');
        Route::get('/zones', [ZoneController::class, 'index'])->name('zones.index');
        Route::get('/lgas', [LgaController::class, 'index'])->name('lgas.index');
        Route::get('/wards', [WardController::class, 'index'])->name('wards.index');
        Route::get('/pus', [PuController::class, 'index'])->name('pus.index');
    });