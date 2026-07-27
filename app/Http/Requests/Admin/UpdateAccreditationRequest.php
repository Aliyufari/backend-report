<?php

namespace App\Http\Requests\Admin;

use App\Enums\RecordStatus;
use App\Traits\ValidatesPuJurisdiction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAccreditationRequest extends FormRequest
{
    use ValidatesPuJurisdiction;
    
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('accreditation')) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $accreditation = $this->route('accreditation');

        return [
            'election_id'       => ['required', 'string', 'exists:elections,id'],
            'pu_id'             => [
                'required', 'string', 'exists:pus,id',
                Rule::unique('accreditations')->where('election_id', $this->input('election_id'))->ignore($accreditation->id),
            ],
            'accredited_voters' => ['required', 'integer', 'min:0'],
            'status'            => ['required', Rule::enum(RecordStatus::class)],
            'image'             => ['nullable', 'image', 'max:5120'],
        ];
    }

    public function withValidator($validator): void
    {
        $this->validatePuJurisdiction($validator);
    }
}
