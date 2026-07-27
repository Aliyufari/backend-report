<?php

namespace App\Traits;

use App\Models\Pu;

trait ValidatesPuJurisdiction
{
    protected function validatePuJurisdiction($validator, string $field = 'pu_id'): void
    {
        $validator->after(function ($validator) use ($field) {
            $pu = Pu::find($this->input($field));

            if (!$pu || !$pu->isWithinJurisdictionOf($this->user())) {
                $validator->errors()->add($field, 'You are not authorized to assign this polling unit.');
            }
        });
    }
}