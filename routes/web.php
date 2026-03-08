<?php

use Laravel\Fortify\Features;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/drivers');

Route::get('/drivers', function () {
    return Inertia::render('drivers/index');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
