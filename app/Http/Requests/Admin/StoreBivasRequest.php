<?php

namespace App\Http\Requests\Admin;

use App\Enums\BivasStatus;
use App\Models\Bivas;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBivasRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Bivas::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'serial_number' => ['required', 'string', 'max:30', 'unique:bivas_machines,serial_number'],
            'status'        => ['required', Rule::enum(BivasStatus::class)],
            'pu_id'         => ['required', 'string', 'exists:pus,id'],
        ];
    }

    public function withValidator($validator): void
    {
        $this->validatePuJurisdiction($validator);
    }
}
