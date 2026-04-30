<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CvrResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'unique_id'  => $this->unique_id,
            'type'       => $this->type,
            'status'     => $this->status,
            'pu_id'      => $this->pu_id,
            'pu'         => new PuResource($this->whenLoaded('pu')),
            'created_by' => new UserResource($this->whenLoaded('creator')),
            'created_at' => $this->created_at,
            'updated_by' => new UserResource($this->whenLoaded('updater')),
            'updated_at' => $this->updated_at
        ];
    }
}
