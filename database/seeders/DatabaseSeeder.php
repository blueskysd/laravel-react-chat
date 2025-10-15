<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Bluey',
            'email' => 'bluey@ludostudios.com',
            'password' => 'password'
        ]);

        User::factory()->create([
            'name' => 'Bingo',
            'email' => 'bingo@ludostudios.com',
            'password' => 'password'
        ]);
    }
}
