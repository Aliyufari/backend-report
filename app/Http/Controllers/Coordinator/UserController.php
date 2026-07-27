<?php

namespace App\Http\Controllers\Coordinator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Coordinator\StoreUserRequest;
use App\Http\Requests\Coordinator\UpdateUserRequest;
use App\Http\Resources\RoleResource;
use App\Http\Resources\UserResource;
use App\Models\Role as RoleModel;
use App\Models\User;
use App\Traits\ScopesOwnLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    use ScopesOwnLocation;

    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);
        $authUser = $request->user();

        try {
            $users = User::visibleTo($authUser)
                ->with(['roles', 'location'])
                ->when($request->filled('search'), function ($q) use ($request) {
                    $search = $request->search;
                    $q->where(fn($query) => $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
                })
                ->when($request->filled('role'), function ($q) use ($request) {
                    $q->whereHas('roles', fn($roleQuery) => $roleQuery->where('name', $request->role));
                })
                ->latest()
                ->paginate()
                ->withQueryString();

            $roles = RoleModel::query()->assignableBy($authUser)->orderBy('name')->get();

            return inertia('dashboard/coordinator/coordinators/Index', [
                'users'         => UserResource::collection($users),
                'roles'         => RoleResource::collection($roles),
                'locations'     => $this->buildLocations($authUser),
                'locationScope' => $this->locationScope($authUser),
                'filters'       => $request->only(['search', 'role']),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load users', ['message' => $e->getMessage(), 'user_id' => $authUser->id]);

            return back()->withErrors(['general' => 'Unable to load users.']);
        }
    }

    public function store(StoreUserRequest $request)
    {
        $this->authorize('create', User::class);

        $authUser = $request->user();
        $data     = $request->validated();

        $role = RoleModel::findById($data['role_id']);
        unset($data['role_id']);

        abort_unless($authUser->canCreateRole($role->name), 403, 'Unauthorized to create this role.');
        abort_unless(
            $authUser->canAssignLocation($data['location_type'] ?? null, $data['location_id'] ?? null),
            403,
            'Unauthorized to assign this location.'
        );

        try {
            DB::transaction(function () use ($request, $data, $role) {
                if ($request->hasFile('avatar')) {
                    $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
                }

                $user = new User($data);
                $user->save();
                $user->syncRoles([$role->name]);
            });

            return redirect()->route('coordinator.users.index')->with([
                'status'  => true,
                'message' => 'User created successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to create user', ['message' => $e->getMessage(), 'user_id' => $authUser->id]);

            return back()->withErrors(['general' => 'Failed to create user. Please try again.']);
        }
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', $user);

        $authUser = $request->user();
        $data     = $request->validated();

        if (!empty($data['role_id'])) {
            $role = RoleModel::findById($data['role_id']);
            abort_unless($authUser->canCreateRole($role->name), 403, 'Unauthorized to assign this role.');
        }

        if (array_key_exists('location_type', $data) || array_key_exists('location_id', $data)) {
            $locationType = $data['location_type'] ?? $user->location_type?->value;
            $locationId   = $data['location_id'] ?? $user->location_id;

            abort_unless(
                $authUser->canAssignLocation($locationType, $locationId),
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
                    $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
                }

                if (!empty($data['role_id'])) {
                    $role = RoleModel::findById($data['role_id']);
                    unset($data['role_id']);
                    $user->syncRoles([$role->name]);
                }

                $user->update($data);
            });

            return redirect()->route('coordinator.users.index')->with([
                'status'  => true,
                'message' => 'User updated successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to update user', ['message' => $e->getMessage(), 'user_id' => $user->id, 'auth_id' => $authUser->id]);

            return back()->withErrors(['general' => 'Failed to update user. Please try again.']);
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

            return redirect()->route('coordinator.users.index')->with([
                'status'  => true,
                'message' => 'User deleted successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to delete user', ['message' => $e->getMessage(), 'user_id' => $user->id, 'auth_id' => $authUser->id]);

            return back()->withErrors(['general' => 'Failed to delete user. Please try again.']);
        }
    }
}