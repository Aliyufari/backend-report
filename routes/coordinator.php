<?php

use App\Http\Controllers\Coordinator\AccreditationController;
use App\Http\Controllers\Coordinator\CountdownController;
use App\Http\Controllers\Coordinator\CvrController;
use App\Http\Controllers\Coordinator\DashboardController;
use App\Http\Controllers\Coordinator\EoController;
use App\Http\Controllers\Coordinator\ProfileController;
use App\Http\Controllers\Coordinator\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware([
        'auth',
        'role:state_coordinator|zonal_coordinator|lga_coordinator|ward_coordinator',
    ])
    ->prefix('coordinator')
    ->name('coordinator.')
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
        | Coordinators (Scoped to Current User's Location)
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
        | CVRs (Scoped to Current User's Location)
        |--------------------------------------------------------------------------
        */

        Route::prefix('cvrs')
            ->name('cvrs.')
            ->group(function () {

                Route::get('/', [CvrController::class, 'index'])
                    ->name('index');

                Route::post('/', [CvrController::class, 'store'])
                    ->name('store');

                Route::put('/{cvr}', [CvrController::class, 'update'])
                    ->name('update');

                Route::delete('/{cvr}', [CvrController::class, 'destroy'])
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
        | Accreditations (Read Only)
        |--------------------------------------------------------------------------
        */

        Route::get('/accreditations', [AccreditationController::class, 'index'])
            ->name('accreditations.index');
    });