<?php

namespace App\Http\Requests\Governor;

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
            'date_joined' => ['nullable', 'date'],
        ];
    }

    /**
     * Governor doesn't choose a state — it's forced to their own,
     * so there's no field a governor could tamper with to assign
     * staff elsewhere.
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);
        $data['state_id'] = $this->user()->location_id;

        return $data;
    }
}
