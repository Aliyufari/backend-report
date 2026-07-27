<?php

use App\Models\Pu;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bivas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('serial_number')->unique();
            $table->string('status')->default('active'); // active | inactive | faulty | maintenance
            $table->foreignIdFor(Pu::class, 'pu_id')->nullable();
            $table->foreignIdFor(User::class, 'created_by_id')->nullable();
            $table->foreignIdFor(User::class, 'updated_by_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bivas');
    }
};
