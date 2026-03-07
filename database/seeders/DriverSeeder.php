<?php

namespace Database\Seeders;

use App\Models\Driver;
use Illuminate\Database\Seeder;

class DriverSeeder extends Seeder
{
    public function run(): void
    {
        Driver::insert([
            [
                'name' => 'Carlos Henrique Souza',
                'cpf' => '123.456.789-01',
                'cnh_category' => 'E',
                'phone' => '11999990001',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fernanda Lima Rocha',
                'cpf' => '123.456.789-02',
                'cnh_category' => 'D',
                'phone' => '11999990002',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Joao Pedro Martins',
                'cpf' => '123.456.789-03',
                'cnh_category' => 'E',
                'phone' => '11999990003',
                'is_active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Mariana Alves Costa',
                'cpf' => '123.456.789-04',
                'cnh_category' => 'C',
                'phone' => '11999990004',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ricardo Gomes Silva',
                'cpf' => '123.456.789-05',
                'cnh_category' => 'C',
                'phone' => '11999990005',
                'is_active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}