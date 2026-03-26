<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Models\State;
use App\Models\User;
use Illuminate\Http\Request;
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
            $this->authorize('viewAny', User::class);

            $users = User::visibleTo(auth()->user())
                ->with('role')
                ->when(
                    $request->search,
                    fn($q, $s) =>
                    $q->where('name', 'like', "%{$s}%")
                        ->orWhere('email', 'like', "%{$s}%")
                )
                ->when(
                    $request->role,
                    fn($q, $r) =>
                    $q->where('role_id', $r)
                )
                ->latest()
                ->paginate()
                ->withQueryString();

            $state = State::with(['zones.lgas.wards.pus'])->orderBy('name')->get();

            return inertia('dashboard/admin/users/Index', [
                'users'   => $users,
                'roles'   => RoleResource::collection(Role::orderBy('name')->get()),
                'state'   => $state,
                'filters' => $request->only(['search', 'role']),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load users', ['message' => $e->getMessage()]);
            return back()->with(['status' => false, 'message' => 'Unable to load users']);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        try {
            $this->authorize('create', User::class);

            $data = $request->validated();

            if ($request->hasFile('avatar')) {
                $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
            }

            User::create($data);

            return back()->with([
                'status' => true,
                'message' => 'User created'
            ]);
        } catch (\Throwable $e) {
            Log::error(
                'Failed to create user',
                ['message' => $e->getMessage(), 'data' => $request->validated()]
            );

            return back()->with([
                'status' => false,
                'message' => 'Failed to create user'
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        try {
            $this->authorize('update', $user);

            $data = $request->validated();

            if ($request->hasFile('avatar')) {
                if ($user->avatar) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
            }

            $user->update($data);

            return back()->with([
                'status' => true,
                'message' => 'User updated'
            ]);
        } catch (\Throwable $e) {
            Log::error(
                'Failed to update user',
                ['message' => $e->getMessage(), 'user_id' => $user->id]
            );

            return back()->with([
                'status' => false,
                'message' => 'Failed to update user'
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        try {
            $this->authorize('delete', $user);

            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $user->delete();

            return back()->with([
                'status' => true,
                'message' => 'User deleted successfully'
            ]);
        } catch (\Throwable $e) {
            Log::error(
                'Failed to delete user',
                ['message' => $e->getMessage(), 'user_id' => $user->id]
            );

            return back()->with([
                'status' => false,
                'message' => 'Failed to delete user'
            ]);
        }
    }
}
