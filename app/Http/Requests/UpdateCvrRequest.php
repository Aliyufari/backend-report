<?php

namespace App\Http\Requests;

use App\Enums\CvrStatus;
use App\Enums\CvrType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateCvrRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $cvrId = $this->route('cvr')?->id;

        return [
            'unique_id' => ['sometimes', 'uuid', 'unique:cvrs,unique_id,' . $cvrId],
            'type'      => ['sometimes', new Enum(CvrType::class)],
            'status'    => ['sometimes', new Enum(CvrStatus::class)],
            'pu_id'     => ['sometimes', 'uuid', 'exists:pus,id'],
        ];
    }
}
