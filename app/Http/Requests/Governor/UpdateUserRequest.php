<?php

namespace App\Http\Requests\Governor;

use App\Enums\Location;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('user')) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:255'],
            'email'         => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('user')->id)],
            'password'      => ['nullable', Password::min(6)],
            'role_id'       => ['nullable', 'string', 'exists:roles,id'],
            'avatar'        => ['nullable', 'image', 'max:2048'],
            'location_type' => ['nullable', Rule::enum(Location::class)],
            'location_id'   => ['nullable', 'string'],
        ];
    }
}
