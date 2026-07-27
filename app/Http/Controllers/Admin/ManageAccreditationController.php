<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RecordStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAccreditationRequest;
use App\Http\Requests\Admin\UpdateAccreditationRequest;
use App\Http\Resources\AccreditationResource;
use App\Models\Accreditation;
use App\Models\Election;
use App\Models\State;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ManageAccreditationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Accreditation::class);
        $user = $request->user();

        try {
            $records = Accreditation::visibleTo($user)
                ->with(['pu.ward.lga.zone.state', 'election'])
                ->when($request->election_id, fn($q, $e) => $q->where('election_id', $e))
                ->when($request->status, fn($q, $s) => $q->where('status', $s))
                ->latest()
                ->paginate()
                ->withQueryString();

            return inertia('dashboard/admin/accreditations/manage/Index', [
                'records'       => AccreditationResource::collection($records),
                'elections'     => Election::orderByDesc('election_date')->get(['id', 'title', 'type']),
                'locations'     => State::with(['zones.lgas.wards.pus'])->orderBy('name')->get()->toArray(),
                'locationScope' => 'state',
                'filters'       => $request->only(['election_id', 'status']),
                'statuses'      => collect(RecordStatus::cases())->map(fn($s) => ['value' => $s->value, 'label' => ucfirst($s->name)]),
                'permissions'   => ['can_create' => $user->can('create', Accreditation::class)],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load accreditation records', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Unable to load accreditation records.']);
        }
    }

    public function store(StoreAccreditationRequest $request)
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('image')) {
                $data['image_path'] = $request->file('image')->store('accreditations', 'public');
            }

            Accreditation::create($data);

            return back()->with(['status' => true, 'message' => 'Accreditation record saved successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to create accreditation record', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Failed to save accreditation record.']);
        }
    }

    public function update(UpdateAccreditationRequest $request, Accreditation $accreditation)
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('image')) {
                if ($accreditation->image_path) {
                    Storage::disk('public')->delete($accreditation->image_path);
                }
                $data['image_path'] = $request->file('image')->store('accreditations', 'public');
            }

            $accreditation->update($data);

            return back()->with(['status' => true, 'message' => 'Accreditation record updated successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to update accreditation record', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Failed to update accreditation record.']);
        }
    }

    public function destroy(Accreditation $accreditation)
    {
        $this->authorize('delete', $accreditation);

        try {
            if ($accreditation->image_path) {
                Storage::disk('public')->delete($accreditation->image_path);
            }
            $accreditation->delete();

            return back()->with(['status' => true, 'message' => 'Accreditation record removed.']);
        } catch (\Throwable $e) {
            Log::error('Failed to delete accreditation record', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Failed to remove accreditation record.']);
        }
    }
}