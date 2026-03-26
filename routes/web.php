<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard/admin/Index');
    })->name('dashboard');
});

require __DIR__ . '/profile.php';
require __DIR__ . '/users.php';
require __DIR__ . '/upload.php';
require __DIR__ . '/auth.php';
