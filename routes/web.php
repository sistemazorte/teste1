<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

use Inertia\Inertia;

Route::get('/drivers', function () {
    return Inertia::render('drivers/index');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
