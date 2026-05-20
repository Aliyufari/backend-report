<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CountdownController;

Route::middleware(['auth', 'role:super_admin|admin'])->prefix('admin')->group(function () {
    Route::get('/countdown', [CountdownController::class, 'index']);
});