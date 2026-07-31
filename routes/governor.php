<?php

use App\Http\Controllers\Governor\AccreditationReportController;
use App\Http\Controllers\Governor\BivasController;
use App\Http\Controllers\Governor\CountdownController;
use App\Http\Controllers\Governor\CvrReportController;
use App\Http\Controllers\Governor\DashboardController;
use App\Http\Controllers\Governor\EoController;
use App\Http\Controllers\Governor\LgaController;
use App\Http\Controllers\Governor\ProfileController;
use App\Http\Controllers\Governor\PuController;
use App\Http\Controllers\Governor\StaffController;
use App\Http\Controllers\Governor\UserController;
use App\Http\Controllers\Governor\WardController;
use App\Http\Controllers\Governor\ZoneController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:governor'])
    ->prefix('governor')
    ->name('governor.')
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('dashboard');


        /*
        |--------------------------------------------------------------------------
        | My Profile
        |--------------------------------------------------------------------------
        */

        Route::prefix('profile')
            ->name('profile.')
            ->group(function () {

                Route::get('/', [ProfileController::class, 'index'])
                    ->name('index');

                Route::put('/info', [ProfileController::class, 'updateInfo'])
                    ->name('info');

                Route::put('/email', [ProfileController::class, 'updateEmail'])
                    ->name('email');

                Route::put('/password', [ProfileController::class, 'updatePassword'])
                    ->name('password');
            });


        /*
        |--------------------------------------------------------------------------
        | Coordinators
        |--------------------------------------------------------------------------
        */

        Route::prefix('coordinators')
            ->name('users.')
            ->group(function () {

                Route::get('/', [UserController::class, 'index'])
                    ->name('index');

                Route::post('/', [UserController::class, 'store'])
                    ->name('store');

                Route::put('/{user}', [UserController::class, 'update'])
                    ->name('update');

                Route::delete('/{user}', [UserController::class, 'destroy'])
                    ->name('destroy');
            });


        /*
        |--------------------------------------------------------------------------
        | Election Countdown
        |--------------------------------------------------------------------------
        */

        Route::get('/countdown', [CountdownController::class, 'index'])
            ->name('countdown.index');


        /*
        |--------------------------------------------------------------------------
        | Election Officers (Read Only)
        |--------------------------------------------------------------------------
        */

        Route::get('/eos', [EoController::class, 'index'])
            ->name('eos.index');


        /*
        |--------------------------------------------------------------------------
        | CVR Report
        |--------------------------------------------------------------------------
        */

        Route::prefix('cvrs-report')
            ->name('cvrs-report.')
            ->group(function () {

                Route::get('/', [CvrReportController::class, 'states'])
                    ->name('index');

                Route::get('/states/{state}/zones', [CvrReportController::class, 'zones'])
                    ->name('zones');

                Route::get('/zones/{zone}/lgas', [CvrReportController::class, 'lgas'])
                    ->name('lgas');

                Route::get('/lgas/{lga}/wards', [CvrReportController::class, 'wards'])
                    ->name('wards');

                Route::get('/wards/{ward}/pus', [CvrReportController::class, 'pus'])
                    ->name('pus');

                Route::get('/pus/{pu}', [CvrReportController::class, 'show'])
                    ->name('pu');
            });


        /*
        |--------------------------------------------------------------------------
        | Accreditation Report
        |--------------------------------------------------------------------------
        */

        Route::prefix('accreditations')
            ->name('accreditations.')
            ->group(function () {

                Route::get('/', [AccreditationReportController::class, 'states'])
                    ->name('index');

                Route::get('/states/{state}/zones', [AccreditationReportController::class, 'zones'])
                    ->name('zones');

                Route::get('/zones/{zone}/lgas', [AccreditationReportController::class, 'lgas'])
                    ->name('lgas');

                Route::get('/lgas/{lga}/wards', [AccreditationReportController::class, 'wards'])
                    ->name('wards');

                Route::get('/wards/{ward}/pus', [AccreditationReportController::class, 'pus'])
                    ->name('pus');

                Route::get('/pus/{pu}', [AccreditationReportController::class, 'show'])
                    ->name('pu');
            });


        /*
        |--------------------------------------------------------------------------
        | BIVAS Machines (Read Only)
        |--------------------------------------------------------------------------
        */

        Route::get('/bivas', [BivasController::class, 'index'])
            ->name('bivas.index');


        /*
        |--------------------------------------------------------------------------
        | Locations (Read Only)
        |--------------------------------------------------------------------------
        */

        Route::get('/zones', [ZoneController::class, 'index'])
            ->name('zones.index');

        Route::get('/lgas', [LgaController::class, 'index'])
            ->name('lgas.index');

        Route::get('/wards', [WardController::class, 'index'])
            ->name('wards.index');

        Route::get('/pus', [PuController::class, 'index'])
            ->name('pus.index');

        // ── Staffing (scoped to governor's own state) ──────────────────────
        Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
        Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::put('/staff/{staff}', [StaffController::class, 'update'])->name('staff.update');
        Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])->name('staff.destroy');
    });