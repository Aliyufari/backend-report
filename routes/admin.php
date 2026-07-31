<?php

use App\Http\Controllers\Admin\{ AccreditationReportController, BivasController, CountdownController, CvrController, CvrReportController, DashboardController, ElectionController, EoController, ExcelUploadController, LgaController, ManageAccreditationController, ProfileController, PuController, ResultController, StaffController, StateController, UserController, WardController, ZoneController };
use App\Http\Controllers\Admin\SettingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super_admin|admin'])
    ->prefix('admin')
    ->name('admin.')
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
        | Profile
        |--------------------------------------------------------------------------
        */

        Route::prefix('profile')->name('profile.')->group(function () {
            Route::get('/', [ProfileController::class, 'index'])->name('index');
            Route::put('/info', [ProfileController::class, 'updateInfo'])->name('info');
            Route::put('/email', [ProfileController::class, 'updateEmail'])->name('email');
            Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password');
        });

        /*
        |--------------------------------------------------------------------------
        | Users
        |--------------------------------------------------------------------------
        */

        Route::resource('users', UserController::class)
            ->except(['create', 'edit', 'show']);

        /*
        |--------------------------------------------------------------------------
        | CVRs
        |--------------------------------------------------------------------------
        */

        Route::resource('cvrs', CvrController::class)
            ->except(['create', 'edit', 'show']);

        /*
        |--------------------------------------------------------------------------
        | Locations
        |--------------------------------------------------------------------------
        */

        Route::resource('states', StateController::class)->except(['show']);
        Route::resource('zones', ZoneController::class)->except(['show']);
        Route::resource('lgas', LgaController::class)->except(['show']);
        Route::resource('wards', WardController::class)->except(['show']);
        Route::resource('pus', PuController::class)->except(['show']);

        /*
        |--------------------------------------------------------------------------
        | Upload
        |--------------------------------------------------------------------------
        */

        Route::controller(ExcelUploadController::class)
            ->prefix('upload')
            ->name('upload.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/', 'store')->name('store');
                Route::get('{uploadId}/progress', 'progress')->name('progress');
            });

        /*
        |--------------------------------------------------------------------------
        | Reports
        |--------------------------------------------------------------------------
        */

        Route::get('/countdown', [CountdownController::class, 'index'])
            ->name('countdown.index');

        Route::resource('eos', EoController::class)
            ->only(['index', 'store', 'update', 'destroy']);

        Route::prefix('cvrs-report')->name('cvrs-report.')->group(function () {
            Route::get('/', [CvrReportController::class, 'states'])->name('index');
            Route::get('/states/{state}/zones', [CvrReportController::class, 'zones'])->name('zones');
            Route::get('/zones/{zone}/lgas', [CvrReportController::class, 'lgas'])->name('lgas');
            Route::get('/lgas/{lga}/wards', [CvrReportController::class, 'wards'])->name('wards');
            Route::get('/wards/{ward}/pus', [CvrReportController::class, 'pus'])->name('pus');
            Route::get('/pus/{pu}', [CvrReportController::class, 'show'])->name('pu');
        });

        Route::prefix('accreditations')->name('accreditations.')->group(function () {
            Route::get('/', [AccreditationReportController::class, 'states'])->name('index');
            Route::get('/states/{state}/zones', [AccreditationReportController::class, 'zones'])->name('zones');
            Route::get('/zones/{zone}/lgas', [AccreditationReportController::class, 'lgas'])->name('lgas');
            Route::get('/lgas/{lga}/wards', [AccreditationReportController::class, 'wards'])->name('wards');
            Route::get('/wards/{ward}/pus', [AccreditationReportController::class, 'pus'])->name('pus');
            Route::get('/pus/{pu}', [AccreditationReportController::class, 'show'])->name('pu');
        });

        /*
        |--------------------------------------------------------------------------
        | Management
        |--------------------------------------------------------------------------
        */

        Route::resource('manage-accreditation', ManageAccreditationController::class)
            ->parameters(['manage-accreditation' => 'accreditation'])
            ->except(['create', 'edit', 'show']);

        Route::resource('bivas', BivasController::class)
            ->except(['create', 'edit', 'show']);

        Route::resource('elections', ElectionController::class)
            ->except(['create', 'edit', 'show']);

        Route::get('/elections/readiness', [ElectionController::class, 'readiness'])
            ->name('elections.readiness');

        Route::resource('manage-results', ResultController::class)
            ->parameters(['manage-results' => 'result'])
            ->except(['create', 'edit', 'show']);

        // ── Staffing ──────────────────────────────────────────────────────
        Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
        Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::put('/staff/{staff}', [StaffController::class, 'update'])->name('staff.update');
        Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])->name('staff.destroy');

        // ── Settings ──────────────────────────────────────────────────────
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
    });