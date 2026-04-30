<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CvrController;

Route::middleware(['auth', 'role:super_admin|admin'])->prefix('admin')->group(function () {
    Route::get('/cvrs', [CvrController::class, 'index'])->name('cvrs.index');
    Route::post('/cvrs', [CvrController::class, 'store'])->name('cvrs.store');
    Route::put('/cvrs/{cvr}', [CvrController::class, 'update'])->name('cvrs.update');
    Route::delete('/cvrs/{cvr}', [CvrController::class, 'destroy'])->name('cvrs.destroy');
});
