<?php

namespace App\Http\Requests\Admin;

use App\Enums\Department;
use App\Enums\StaffStatus;
use App\Models\Staff;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStaffRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Staff::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'staff_id'    => ['required', 'string', 'max:30', 'unique:staff,staff_id'],
            'first_name'  => ['required', 'string', 'max:100'],
            'last_name'   => ['required', 'string', 'max:100'],
            'email'       => ['nullable', 'email', 'max:255'],
            'phone'       => ['nullable', 'string', 'max:30'],
            'department'  => ['required', Rule::enum(Department::class)],
            'position'    => ['nullable', 'string', 'max:150'],
            'status'      => ['required', Rule::enum(StaffStatus::class)],
            'state_id'    => ['nullable', 'string', 'exists:states,id'],
            'date_joined' => ['nullable', 'date'],
        ];
    }
}
