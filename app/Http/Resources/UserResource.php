<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,

            'role' => $this->whenLoaded('roles', function () {
                $role = $this->roles->first();

                return $role
                    ? ['id' => $role->id, 'name' => $role->name]
                    : null;
            }),

            'location_type' => $this->location_type?->value ?? $this->location_type,
            'location_id' => $this->location_id,

            'location' => $this->when(
                $this->relationLoaded('location') && $this->location,
                fn() => [
                    'id' => $this->location->id,
                    'name' => $this->location->name ?? null,
                    'code' => $this->location->code ?? null,
                ]
            ),

            'created_by' => new UserResource($this->whenLoaded('creator')),
            'created_at' => $this->created_at,

            'updated_by' => new UserResource($this->whenLoaded('updater')),
            'updated_at' => $this->updated_at
        ];
    }
}
