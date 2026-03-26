<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ExcelUploadController;

Route::middleware(['auth'])->prefix('admin')->group(function () {
    Route::get('/upload', [ExcelUploadController::class, 'index'])->name('upload.index');
    Route::post('/upload', [ExcelUploadController::class, 'store'])->name('upload.store');
    Route::get('/upload/{uploadId}/progress', [ExcelUploadController::class, 'progress'])->name('upload.progress');
});
