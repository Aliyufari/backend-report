<?php

namespace App\Http\Requests;

use App\Enums\CvrStatus;
use App\Enums\CvrType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreCvrRequest extends FormRequest
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
        return [
            'unique_id' => ['required', 'uuid', 'unique:cvrs,unique_id'],
            'type'      => ['required', new Enum(CvrType::class)],
            'status'    => ['required', new Enum(CvrStatus::class)],
            'pu_id'     => ['required', 'uuid', 'exists:pus,id'],
        ];
    }
}
