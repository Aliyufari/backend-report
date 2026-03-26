<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id'    => $this->id,
            'name'  => ucwords(str_replace('_', ' ', $this->name)),
            'value' => $this->id,
            'label' => ucwords(str_replace('_', ' ', $this->name)),
            // 'can' => [
            //     'view' => $user?->can('view', $this->resource) ?? false,
            //     'update' => $user?->can('update', $this->resource) ?? false,
            //     'delete' => $user?->can('delete', $this->resource) ?? false,
            // ]
        ];
    }
}
