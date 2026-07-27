<?php

namespace App\Http\Requests\Admin;

use App\Enums\ElectionStatus;
use App\Enums\ElectionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateElectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('election')) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title'         => ['required', 'string', 'max:255'],
            'type'          => ['nullable', Rule::enum(ElectionType::class)],
            'election_date' => ['nullable', 'date'],
            'status'        => ['required', Rule::enum(ElectionStatus::class)],
        ];
    }
}
