<?php

namespace App\Http\Requests\Admin;

use App\Enums\CvrStatus;
use App\Enums\CvrType;
use App\Models\Pu;
use App\Traits\ValidatesCvrPu;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCvrRequest extends FormRequest
{
    use ValidatesCvrPu;
    
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('cvr')) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $cvr = $this->route('cvr');

        return [
            'unique_id' => ['required', 'string', 'max:20', Rule::unique('cvrs', 'unique_id')->ignore($cvr->id)],
            'type'      => ['required', Rule::enum(CvrType::class)],
            'status'    => ['required', Rule::enum(CvrStatus::class)],
            'pu_id'     => ['required', 'string', 'exists:pus,id'],
        ];
    }

    public function withValidator($validator): void
    {
        $this->validatePuJurisdiction($validator);
    }
}
