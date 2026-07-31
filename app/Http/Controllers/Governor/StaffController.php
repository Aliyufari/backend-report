<?php

namespace App\Http\Controllers\Governor;

use App\Enums\Department;
use App\Enums\StaffStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Governor\StoreStaffRequest;
use App\Http\Requests\Governor\UpdateStaffRequest;
use App\Http\Resources\StaffResource;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Staff::class);
        $user = $request->user();

        try {
            $staff = Staff::visibleTo($user)
                ->with('state')
                ->when($request->search, function ($q, $s) {
                    $q->where(function ($query) use ($s) {
                        $query->where('first_name', 'like', "%{$s}%")
                            ->orWhere('last_name', 'like', "%{$s}%")
                            ->orWhere('staff_id', 'like', "%{$s}%");
                    });
                })
                ->when($request->department, fn ($q, $d) => $q->where('department', $d))
                ->when($request->status, fn ($q, $s) => $q->where('status', $s))
                ->latest()
                ->paginate()
                ->withQueryString();

            $baseQuery = Staff::visibleTo($user);

            return inertia('dashboard/governor/staff/Index', [
                'staff'       => StaffResource::collection($staff),
                'departments' => collect(Department::cases())->map(fn ($d) => ['value' => $d->value, 'label' => $d->label()]),
                'statuses'    => collect(StaffStatus::cases())->map(fn ($s) => ['value' => $s->value, 'label' => ucfirst(str_replace('_', ' ', $s->name))]),
                'filters'     => $request->only(['search', 'department', 'status']),
                'statistics'  => [
                    'total'    => (clone $baseQuery)->count(),
                    'active'   => (clone $baseQuery)->where('status', StaffStatus::ACTIVE)->count(),
                    'on_leave' => (clone $baseQuery)->where('status', StaffStatus::ON_LEAVE)->count(),
                ],
                'permissions' => ['can_create' => $user->can('create', Staff::class)],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load staff', ['message' => $e->getMessage(), 'user_id' => $user->id]);

            return back()->withErrors(['general' => 'Unable to load staff records.']);
        }
    }

    public function store(StoreStaffRequest $request)
    {
        try {
            Staff::create($request->validated());

            return back()->with(['status' => true, 'message' => 'Staff member added successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to create staff', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Failed to add staff member.']);
        }
    }

    public function update(UpdateStaffRequest $request, Staff $staff)
    {
        try {
            $staff->update($request->validated());

            return back()->with(['status' => true, 'message' => 'Staff member updated successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to update staff', ['message' => $e->getMessage(), 'staff_id' => $staff->id]);

            return back()->withErrors(['general' => 'Failed to update staff member.']);
        }
    }

    public function destroy(Staff $staff)
    {
        $this->authorize('delete', $staff);

        try {
            $staff->delete();

            return back()->with(['status' => true, 'message' => 'Staff member removed.']);
        } catch (\Throwable $e) {
            Log::error('Failed to delete staff', ['message' => $e->getMessage(), 'staff_id' => $staff->id]);

            return back()->withErrors(['general' => 'Failed to remove staff member.']);
        }
    }
}