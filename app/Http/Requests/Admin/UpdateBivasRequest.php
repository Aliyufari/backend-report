<?php

namespace App\Http\Requests\Admin;

use App\Enums\BivasStatus;
use App\Traits\ValidatesPuJurisdiction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBivasRequest extends FormRequest
{
    use ValidatesPuJurisdiction;
    
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('bivas')) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $bivas = $this->route('bivas');

        return [
            'serial_number' => ['required', 'string', 'max:30', Rule::unique('bivas_machines', 'serial_number')->ignore($bivas->id)],
            'status'        => ['required', Rule::enum(BivasStatus::class)],
            'pu_id'         => ['required', 'string', 'exists:pus,id'],
        ];
    }

    public function withValidator($validator): void
    {
        $this->validatePuJurisdiction($validator);
    }
}
