<?php

namespace App\Providers;

use App\Models\Lga;
use App\Models\Pu;
use App\Models\State;
use App\Models\User;
use App\Models\Ward;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();

        Schema::defaultStringLength(191);

        Relation::enforceMorphMap([
            'user'  => User::class,

            'state' => State::class,
            'zone'  => Zone::class,
            'lga'   => Lga::class,
            'ward'  => Ward::class,
            'pu'    => Pu::class,
        ]);
    }
}
