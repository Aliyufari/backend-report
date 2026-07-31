<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Read a setting value by key, cached, with a fallback default.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever("setting:{$key}", function () use ($key, $default) {
            $row = static::where('key', $key)->first();

            return $row?->value ?? $default;
        });
    }

    /**
     * Write (or update) a setting value by key.
     */
    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget("setting:{$key}");
    }

    /**
     * Read many keys at once, e.g. for populating a settings form.
     */
    public static function many(array $keys): array
    {
        $rows = static::whereIn('key', $keys)->pluck('value', 'key');

        return collect($keys)->mapWithKeys(fn ($key) => [$key => $rows[$key] ?? null])->all();
    }
}