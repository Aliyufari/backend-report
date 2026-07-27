<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccreditationResource extends JsonResource
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

            'election_id' => $this->election_id,
            'election' => $this->whenLoaded('election', fn () => [
                'id'         => $this->election->id,
                'title'      => $this->election->title,
                'type'       => $this->election->type?->value ?? $this->election->type,
                'type_label' => $this->election->type?->label(),
            ]),

            'pu_id' => $this->pu_id,
            'pu' => $this->whenLoaded('pu', function () {
                $ward = $this->pu->relationLoaded('ward') ? $this->pu->ward : null;
                $lga  = $ward?->relationLoaded('lga') ? $ward->lga : null;
                $zone = $lga?->relationLoaded('zone') ? $lga->zone : null;
                $state = $zone?->relationLoaded('state') ? $zone->state : null;

                return [
                    'id'   => $this->pu->id,
                    'code' => $this->pu->code,
                    'name' => $this->pu->name,

                    'ward' => $ward ? [
                        'id'   => $ward->id,
                        'name' => $ward->name,
                    ] : null,

                    'lga' => $lga ? [
                        'id'   => $lga->id,
                        'name' => $lga->name,
                    ] : null,

                    'zone' => $zone ? [
                        'id'   => $zone->id,
                        'name' => $zone->name,
                    ] : null,

                    'state' => $state ? [
                        'id'   => $state->id,
                        'name' => $state->name,
                    ] : null,
                ];
            }),

            'accredited_voters' => $this->accredited_voters,

            'status'       => $this->status?->value ?? $this->status,
            'status_label' => $this->status?->name,

            'image_path' => $this->image_path,
            'image_url'  => $this->image_path
                ? asset('storage/' . $this->image_path)
                : null,

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}