<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Location;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\RoleResource;
use App\Http\Resources\UserResource;
use App\Models\Lga;
use App\Models\Role as RoleModel;
use App\Models\State;
use App\Models\User;
use App\Models\Ward;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        /** @var User $authUser */
        $authUser = $request->user();

        try {
            $users = User::visibleTo($authUser)
                ->with(['roles', 'location'])
                ->when($request->filled('search'), function ($query) use ($request) {
                    $search = $request->search;

                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->when($request->filled('role'), function ($query) use ($request) {
                    $query->whereHas('roles', function ($roleQuery) use ($request) {
                        $roleQuery->where('name', $request->role);
                    });
                })
                ->latest()
                ->paginate()
                ->withQueryString();

            $roles = RoleModel::query()
                ->assignableBy($authUser)
                ->orderBy('name')
                ->get();

            return inertia('dashboard/admin/users/Index', [
                'users' => UserResource::collection($users),
                'roles' => RoleResource::collection($roles),
                'locations' => $this->buildLocations($authUser),
                'locationScope' => $this->locationScope($authUser),
                'filters' => $request->only([
                    'search',
                    'role',
                ]),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load users', [
                'message' => $e->getMessage(),
                'user_id' => $authUser->id,
            ]);

            return back()->withErrors([
                'general' => 'Unable to load users.',
            ]);
        }
    }

    public function store(StoreUserRequest $request)
    {
        $this->authorize('create', User::class);

        $authUser = $request->user();
        $data = $request->validated();

        $role = RoleModel::findById($data['role_id']);

        unset($data['role_id']);

        abort_unless(
            $authUser->canCreateRole($role->name),
            403,
            'Unauthorized to create this role.'
        );

        abort_unless(
            $authUser->canAssignLocation(
                $data['location_type'] ?? null,
                $data['location_id'] ?? null
            ),
            403,
            'Unauthorized to assign this location.'
        );

        try {
            DB::transaction(function () use ($request, $data, $role) {

                if ($request->hasFile('avatar')) {
                    $data['avatar'] = $request->file('avatar')
                        ->store('avatars', 'public');
                }

                $user = new User($data);

                $user->save();

                $user->syncRoles([$role->name]);
            });

            return redirect()
                ->route('admin.users.index')
                ->with([
                    'status' => true,
                    'message' => 'User created successfully',
                ]);

        } catch (\Throwable $e) {

            Log::error('Failed to create user', [
                'message' => $e->getMessage(),
                'user_id' => $authUser->id,
            ]);

            return back()->withErrors([
                'general' => 'Failed to create user. Please try again.',
            ]);
        }
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', $user);

        $authUser = $request->user();
        $data = $request->validated();

        if (!empty($data['role_id'])) {
            $role = RoleModel::findById($data['role_id']);

            abort_unless(
                $authUser->canCreateRole($role->name),
                403,
                'Unauthorized to assign this role.'
            );
        }

        if (
            array_key_exists('location_type', $data) ||
            array_key_exists('location_id', $data)
        ) {
            $locationType = $data['location_type']
                ?? $user->location_type?->value;

            $locationId = $data['location_id']
                ?? $user->location_id;

            abort_unless(
                $authUser->canAssignLocation(
                    $locationType,
                    $locationId
                ),
                403,
                'Unauthorized to assign this location.'
            );
        }

        try {
            DB::transaction(function () use ($request, $user, $data) {

                if ($request->hasFile('avatar')) {

                    if ($user->avatar) {
                        Storage::disk('public')->delete($user->avatar);
                    }

                    $data['avatar'] = $request->file('avatar')
                        ->store('avatars', 'public');
                }

                if (!empty($data['role_id'])) {
                    $role = RoleModel::findById($data['role_id']);

                    unset($data['role_id']);

                    $user->syncRoles([$role->name]);
                }

                $user->update($data);
            });

            return redirect()
                ->route('admin.users.index')
                ->with([
                    'status' => true,
                    'message' => 'User updated successfully',
                ]);

        } catch (\Throwable $e) {

            Log::error('Failed to update user', [
                'message' => $e->getMessage(),
                'user_id' => $user->id,
                'auth_id' => $authUser->id,
            ]);

            return back()->withErrors([
                'general' => 'Failed to update user. Please try again.',
            ]);
        }
    }

    public function destroy(Request $request, User $user)
    {
        $this->authorize('delete', $user);

        $authUser = $request->user();

        try {
            DB::transaction(function () use ($user) {

                if ($user->avatar) {
                    Storage::disk('public')->delete($user->avatar);
                }

                $user->syncRoles([]);

                $user->delete();
            });

            return redirect()
                ->route('admin.users.index')
                ->with([
                    'status' => true,
                    'message' => 'User deleted successfully',
                ]);

        } catch (\Throwable $e) {

            Log::error('Failed to delete user', [
                'message' => $e->getMessage(),
                'user_id' => $user->id,
                'auth_id' => $authUser->id,
            ]);

            return back()->withErrors([
                'general' => 'Failed to delete user. Please try again.',
            ]);
        }
    }

    private function buildLocations(User $user): array
    {
        // Roles with global access
        if ($user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ])) {
            return State::with(['zones.lgas.wards.pus'])
                ->orderBy('name')
                ->get()
                ->toArray();
        }

        return match ($user->location_type?->value) {
            Location::STATE->value =>
                State::with(['zones.lgas.wards.pus'])
                    ->whereKey($user->location_id)
                    ->get()
                    ->toArray(),

            Location::ZONE->value =>
                Zone::with(['lgas.wards.pus'])
                    ->whereKey($user->location_id)
                    ->get()
                    ->toArray(),

            Location::LGA->value =>
                Lga::with(['wards.pus'])
                    ->whereKey($user->location_id)
                    ->get()
                    ->toArray(),

            Location::WARD->value =>
                Ward::with(['pus'])
                    ->whereKey($user->location_id)
                    ->get()
                    ->toArray(),

            default => [],
        };
    }

    private function locationScope(User $user): string
    {
        if ($user->hasAnyRole([
            Role::SUPER_ADMIN->value,
            Role::ADMIN->value,
        ])) {
            return Location::STATE->value;
        }

        return $user->location_type?->value ?? Location::STATE->value;
    }
}