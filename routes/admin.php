<?php

use App\Http\Controllers\Admin\AccreditationReportController;
use App\Http\Controllers\Admin\BivasController;
use App\Http\Controllers\Admin\CountdownController;
use App\Http\Controllers\Admin\CvrController;
use App\Http\Controllers\Admin\CvrReportController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ElectionController;
use App\Http\Controllers\Admin\ElectionReadinessController;
use App\Http\Controllers\Admin\EoController;
use App\Http\Controllers\Admin\ExcelUploadController;
use App\Http\Controllers\Admin\LgaController;
use App\Http\Controllers\Admin\ManageAccreditationController;
use App\Http\Controllers\Admin\PuController;
use App\Http\Controllers\Admin\ResultController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\StateController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WardController;
use App\Http\Controllers\Admin\ZoneController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super_admin|admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // ── Users ──────────────────────────────────────────────────────────
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

        // ── CVRs ───────────────────────────────────────────────────────────
        Route::get('/cvrs', [CvrController::class, 'index'])->name('cvrs.index');
        Route::post('/cvrs', [CvrController::class, 'store'])->name('cvrs.store');
        Route::put('/cvrs/{cvr}', [CvrController::class, 'update'])->name('cvrs.update');
        Route::delete('/cvrs/{cvr}', [CvrController::class, 'destroy'])->name('cvrs.destroy');

        // ── Location hierarchy ────────────────────────────────────────────
        Route::resource('states', StateController::class)->except(['show']);
        Route::resource('zones', ZoneController::class)->except(['show']);
        Route::resource('lgas', LgaController::class)->except(['show']);
        Route::resource('wards', WardController::class)->except(['show']);
        Route::resource('pus', PuController::class)->except(['show']);

        // ── Upload ─────────────────────────────────────────────────────────
        Route::get('/upload', [ExcelUploadController::class, 'index'])->name('upload.index');
        Route::post('/upload', [ExcelUploadController::class, 'store'])->name('upload.store');
        Route::get('/upload/{uploadId}/progress', [ExcelUploadController::class, 'progress'])->name('upload.progress');

        // ── Election Countdown ────────────────────────────────────────────
        Route::get('/countdown', [CountdownController::class, 'index'])->name('countdown.index');

        // ── Nationwide EOs ─────────────────────────────────────────────────
        Route::get('/eos', [EoController::class, 'index'])->name('eos.index');
        Route::post('/eos', [EoController::class, 'store'])->name('eos.store');
        Route::put('/eos/{eo}', [EoController::class, 'update'])->name('eos.update');
        Route::delete('/eos/{eo}', [EoController::class, 'destroy'])->name('eos.destroy');

        // ── CVR hierarchy report ────────────────────────────────────────────
        Route::prefix('cvrs-report')->name('cvrs-report.')->group(function () {
            Route::get('/', [CvrReportController::class, 'states'])->name('index');
            Route::get('/states/{state}/zones', [CvrReportController::class, 'zones'])->name('zones');
            Route::get('/zones/{zone}/lgas', [CvrReportController::class, 'lgas'])->name('lgas');
            Route::get('/lgas/{lga}/wards', [CvrReportController::class, 'wards'])->name('wards');
            Route::get('/wards/{ward}/pus', [CvrReportController::class, 'pus'])->name('pus');
            Route::get('/pus/{pu}', [CvrReportController::class, 'show'])->name('pu');
        });

        // ── Accreditation drill-down report ───────────────────────────────
        Route::prefix('accreditations')->name('accreditations.')->group(function () {
            Route::get('/', [AccreditationReportController::class, 'states'])->name('index');
            Route::get('/states/{state}/zones', [AccreditationReportController::class, 'zones'])->name('zones');
            Route::get('/zones/{zone}/lgas', [AccreditationReportController::class, 'lgas'])->name('lgas');
            Route::get('/lgas/{lga}/wards', [AccreditationReportController::class, 'wards'])->name('wards');
            Route::get('/wards/{ward}/pus', [AccreditationReportController::class, 'pus'])->name('pus');
            Route::get('/pus/{pu}', [AccreditationReportController::class, 'show'])->name('pu');
        });

        // ── Manage Accreditation (CRUD) ────────────────────────────────────
        Route::get('/manage-accreditation', [ManageAccreditationController::class, 'index'])->name('manage-accreditation.index');
        Route::post('/manage-accreditation', [ManageAccreditationController::class, 'store'])->name('manage-accreditation.store');
        Route::put('/manage-accreditation/{accreditation}', [ManageAccreditationController::class, 'update'])->name('manage-accreditation.update');
        Route::delete('/manage-accreditation/{accreditation}', [ManageAccreditationController::class, 'destroy'])->name('manage-accreditation.destroy');

        // ── Active BIVAS Machines ──────────────────────────────────────────
        Route::get('/bivas', [BivasController::class, 'index'])->name('bivas.index');
        Route::post('/bivas', [BivasController::class, 'store'])->name('bivas.store');
        Route::put('/bivas/{bivas}', [BivasController::class, 'update'])->name('bivas.update');
        Route::delete('/bivas/{bivas}', [BivasController::class, 'destroy'])->name('bivas.destroy');

        Route::get('/elections', [ElectionController::class, 'index'])->name('elections.index');
        Route::post('/elections', [ElectionController::class, 'store'])->name('elections.store');
        Route::put('/elections/{election}', [ElectionController::class, 'update'])->name('elections.update');
        Route::delete('/elections/{election}', [ElectionController::class, 'destroy'])->name('elections.destroy');

        // ── Election Readiness ────────────────────────────────────────────
        Route::get('/elections/readiness', [ElectionController::class, 'readiness'])->name('elections.readiness');

        // ── Manage Results ─────────────────────────────────────────────────
        Route::get('/manage-results', [ResultController::class, 'index'])->name('manage-results.index');
        Route::post('/manage-results', [ResultController::class, 'store'])->name('manage-results.store');
        Route::put('/manage-results/{result}', [ResultController::class, 'update'])->name('manage-results.update');
        Route::delete('/manage-results/{result}', [ResultController::class, 'destroy'])->name('manage-results.destroy');

        // ── Staffing ───────────────────────────────────────────────────────
        Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
    });