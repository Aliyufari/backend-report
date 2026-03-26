<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;

Route::middleware('auth')->prefix('admin')->group(function () {
    Route::get('/profile',                [ProfileController::class, 'index'])->name('profile.index');
    Route::post('/profile/info',          [ProfileController::class, 'updateInfo'])->name('profile.info');
    Route::post('/profile/email',         [ProfileController::class, 'updateEmail'])->name('profile.email');
    Route::post('/profile/password',      [ProfileController::class, 'updatePassword'])->name('profile.password');
});
