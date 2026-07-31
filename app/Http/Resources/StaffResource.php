<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'staff_id'    => $this->staff_id,
            'first_name'  => $this->first_name,
            'last_name'   => $this->last_name,
            'full_name'   => $this->full_name,
            'email'       => $this->email,
            'phone'       => $this->phone,
            'department'  => $this->department,
            'position'    => $this->position,
            'status'      => $this->status,
            'state'       => $this->whenLoaded('state'),
            'state_id'    => $this->state_id,
            'date_joined' => $this->date_joined?->toDateString(),
            'created_at'  => $this->created_at,
        ];
    }
}
