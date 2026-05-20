<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::middleware(['auth', 'role:super_admin|admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard/admin/Index');
    })->name('dashboard');
});

Route::get('/debug', function () {
    $user = auth()->user();

    return [
        'auth' => auth()->check(),
        'user' => $user,
        'roles' => $user?->getRoleNames(),
        'roles_full' => $user?->roles,
        'guard' => config('auth.defaults.guard'),
    ];
});

require __DIR__ . '/auth.php';
require __DIR__ . '/profile.php';
require __DIR__ . '/upload.php';
require __DIR__ . '/cvrs.php';
require __DIR__ . '/users.php';
require __DIR__ . '/locations.php';
require __DIR__ . '/countdown.php';
