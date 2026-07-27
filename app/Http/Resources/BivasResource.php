<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BivasResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'serial_number'  => $this->serial_number,
            'status'         => $this->status,
            'pu_id'          => $this->pu_id,
            'pu'             => $this->whenLoaded('pu'),
            'created_at'     => $this->created_at,
        ];
    }
}
