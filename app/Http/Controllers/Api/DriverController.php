<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDriverRequest;
use App\Http\Requests\UpdateDriverRequest;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;

class DriverController extends Controller
{
    public function index(): JsonResponse
    {
        $drivers = Driver::orderBy('name')->get();

        return response()->json($drivers);
    }

    public function show(int $id): JsonResponse
    {
        $driver = Driver::findOrFail($id);

        return response()->json($driver);
    }

    public function store(StoreDriverRequest $request): JsonResponse
    {
        $driver = Driver::create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json($driver, 201);
    }

    public function update(UpdateDriverRequest $request, int $id): JsonResponse
    {
        $driver = Driver::findOrFail($id);

        $driver->update($request->validated());

        return response()->json($driver);
    }

    public function toggle(int $id): JsonResponse
    {
        $driver = Driver::findOrFail($id);

        $driver->is_active = !$driver->is_active;
        $driver->save();

        return response()->json([
            'message' => $driver->is_active
                ? 'Motorista ativado com sucesso.'
                : 'Motorista inativado com sucesso.',
            'driver' => $driver,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $driver = Driver::findOrFail($id);

        if ($driver->is_active) {
            return response()->json([
                'message' => 'Somente motoristas inativos podem ser excluidos.',
            ], 422);
        }

        $driver->delete();

        return response()->json([
            'message' => 'Motorista excluido com sucesso.',
        ]);
    }
}