<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Settings\ProfileController;

Route::middleware('auth')
    ->prefix('settings')
    ->name('settings.')
    ->group(function () {

    Route::get('/profile', [ProfileController::class, 'index'])->name('profile.index');
    Route::put('/profile/info', [ProfileController::class, 'updateInfo'])->name('profile.update-info');
    Route::put('/profile/email', [ProfileController::class, 'updateEmail'])->name('profile.update-email');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.update-password');
    
});