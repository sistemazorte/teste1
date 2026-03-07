<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DriverController;

Route::get('/drivers', [DriverController::class, 'index']);
Route::get('/drivers/{id}', [DriverController::class, 'show']);
Route::post('/drivers', [DriverController::class, 'store']);
Route::put('/drivers/{id}', [DriverController::class, 'update']);
Route::patch('/drivers/{id}/toggle', [DriverController::class, 'toggle']);
Route::delete('/drivers/{id}', [DriverController::class, 'destroy']);