<?php

namespace App\Traits;

use App\Models\Pu;

trait ValidatesCvrPu
{
    protected function validatePuJurisdiction($validator): void
    {
        $validator->after(function ($validator) {
            $pu = Pu::find($this->input('pu_id'));

            if (!$pu || !$pu->isWithinJurisdictionOf($this->user())) {
                $validator->errors()->add('pu_id', 'You are not authorized to assign this polling unit.');
            }
        });
    }
}
