<?php

namespace App\Http\Requests\Admin;

use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', Setting::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'election_countdown_date'  => ['nullable', 'date'],
            'election_countdown_label' => ['nullable', 'string', 'max:150'],
            'site_name'                => ['nullable', 'string', 'max:150'],
            'support_email'            => ['nullable', 'email', 'max:255'],
        ];
    }
}
