<?php

use App\Models\Election;
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
        Schema::create('results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignIdFor(Election::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Pu::class)->constrained();
            $table->unsignedInteger('total_votes')->default(0);
            $table->json('party_votes')->nullable(); 
            $table->string('image_path')->nullable();
            $table->string('status')->default('pending'); 
            $table->foreignIdFor(User::class, 'created_by_id')->nullable();
            $table->foreignIdFor(User::class, 'updated_by_id')->nullable();
            $table->timestamps();

            $table->unique(['election_id', 'pu_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('results');
    }
};
