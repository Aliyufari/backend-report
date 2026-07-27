<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ElectionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'type'          => $this->type?->value,
            'election_date' => $this->election_date?->toDateString(),
            'status'        => $this->status,
            'created_at'    => $this->created_at,
        ];
    }
}
