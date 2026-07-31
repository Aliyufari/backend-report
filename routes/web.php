<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/governor.php';
require __DIR__ . '/coordinator.php';
// require __DIR__ . '/settings.php';