<?php

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
        Schema::create('cvrs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('unique_id')->nullable()->unique();
            $table->string('type')->nullable();
            $table->string('status')->nullable();
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
        Schema::dropIfExists('cvrs');
    }
};
