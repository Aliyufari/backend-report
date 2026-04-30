<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\RoleResource;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\State;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            /** @var \App\Models\User $authUser */
            $authUser = auth()->user();

            $this->authorize('viewAny', User::class);

            $users = User::visibleTo($authUser)
                ->with(['roles', 'location'])
                ->when($request->filled('search'), function ($q) use ($request) {
                    $search = $request->search;

                    $q->where(function ($query) use ($search) {
                        $query->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                })
                ->when($request->filled('role'), function ($q) use ($request) {
                    $q->whereHas('roles', function ($roleQuery) use ($request) {
                        $roleQuery->where('name', $request->role);
                    });
                })
                ->latest()
                ->paginate()
                ->withQueryString();

            $states = State::query()->with(['zones.lgas.wards.pus'])
                ->orderBy('name')
                ->get();

            $roles = Role::query()->assignableBy($authUser)
                ->orderBy('name')
                ->get();

            return inertia('dashboard/admin/users/Index', [
                'users'   => UserResource::collection($users),
                'roles'   => RoleResource::collection($roles),
                'states'  => $states,
                'filters' => $request->only([
                    'search',
                    'role',
                ]),
            ]);
        } catch (\Throwable $e) {

            Log::error('Failed to load users', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return back()->with([
                'status'  => false,
                'message' => 'Unable to load users',
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {

                $this->authorize('create', User::class);

                $data = $request->validated();

                if ($request->hasFile('avatar')) {
                    $data['avatar'] = $request->file('avatar')
                        ->store('avatars', 'public');
                }

                /**
                 * Frontend sends role_id
                 */
                $role = Role::findById($data['role_id']);
                unset($data['role_id']);

                $user = new User($data);

                /**
                 * Validate before save
                 */
                abort_unless(
                    auth()->user()->canCreateRole($role->name),
                    403,
                    'Unauthorized to create this role'
                );

                $user->save();

                $user->syncRoles([$role->name]);
            });

            return redirect()->route('users.index')->with([
                'status'  => true,
                'message' => 'User created successfully',
            ]);
        } catch (\Throwable $e) {

            Log::error('Failed to create user', [
                'message' => $e->getMessage(),
                'user_id' => auth()->id(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to create user',
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        try {
            DB::transaction(function () use ($request, $user) {

                $this->authorize('update', $user);

                $data = $request->validated();

                if ($request->hasFile('avatar')) {
                    if ($user->avatar) {
                        Storage::disk('public')->delete($user->avatar);
                    }

                    $data['avatar'] = $request->file('avatar')
                        ->store('avatars', 'public');
                }

                if (!empty($data['role_id'])) {

                    $role = Role::findById($data['role_id']);

                    abort_unless(
                        auth()->user()->canCreateRole($role->name),
                        403,
                        'Unauthorized to assign this role'
                    );

                    unset($data['role_id']);

                    $user->syncRoles([$role->name]);
                }

                $user->update($data);
            });

            return redirect()->route('users.index')->with([
                'status'  => true,
                'message' => 'User updated successfully',
            ]);
        } catch (\Throwable $e) {

            Log::error('Failed to update user', [
                'message' => $e->getMessage(),
                'user_id' => $user->id,
                'auth_id' => auth()->id(),
            ]);

            return redirect()->back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to update user',
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        try {
            DB::transaction(function () use ($user) {

                $this->authorize('delete', $user);

                if ($user->avatar) {
                    Storage::disk('public')->delete($user->avatar);
                }

                $user->syncRoles([]);

                $user->delete();
            });

            return redirect()->route('users.index')->with([
                'status'  => true,
                'message' => 'User deleted successfully',
            ]);
        } catch (\Throwable $e) {

            Log::error('Failed to delete user', [
                'message' => $e->getMessage(),
                'user_id' => $user->id,
                'auth_id' => auth()->id(),
            ]);

            return redirect()->back()->with([
                'status'  => false,
                'message' => $e->getMessage() ?: 'Failed to delete user',
            ]);
        }
    }
}
