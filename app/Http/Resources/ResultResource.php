<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResultResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'election_id'  => $this->election_id,
            'election'     => $this->whenLoaded('election'),
            'pu_id'        => $this->pu_id,
            'pu'           => $this->whenLoaded('pu'),
            'total_votes'  => $this->total_votes,
            'party_votes'  => $this->party_votes,
            'status'       => $this->status,
            'image_path'   => $this->image_path,
            'created_at'   => $this->created_at,
        ];
    }
}
