<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Party;
use App\Enums\RecordStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreResultRequest;
use App\Http\Requests\Admin\UpdateResultRequest;
use App\Http\Resources\ResultResource;
use App\Models\Election;
use App\Models\Result;
use App\Models\State;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ResultController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Result::class);
        $user = $request->user();

        try {
            $records = Result::visibleTo($user)
                ->with(['pu.ward.lga.zone.state', 'election'])
                ->when($request->election_id, fn($q, $e) => $q->where('election_id', $e))
                ->when($request->status, fn($q, $s) => $q->where('status', $s))
                ->latest()
                ->paginate()
                ->withQueryString();

            return inertia('dashboard/admin/results/Index', [
                'records'       => ResultResource::collection($records),
                'elections'     => Election::orderByDesc('election_date')->get(['id', 'title']),
                'locations'     => State::with(['zones.lgas.wards.pus'])->orderBy('name')->get()->toArray(),
                'locationScope' => 'state',
                'filters'       => $request->only(['election_id', 'status']),
                'statuses'      => collect(RecordStatus::cases())->map(fn($s) => ['value' => $s->value, 'label' => ucfirst($s->name)]),
                'parties'       => collect(Party::cases())->map(fn($p) => ['value' => $p->value, 'label' => $p->label()]),
                'permissions'   => ['can_create' => $user->can('create', Result::class)],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to load result records', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Unable to load result records.']);
        }
    }

    public function store(StoreResultRequest $request)
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('image')) {
                $data['image_path'] = $request->file('image')->store('results', 'public');
            }

            Result::create($data);

            return back()->with(['status' => true, 'message' => 'Result record saved successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to create result record', ['message' => $e->getMessage()]);

            return back()->withErrors(['general' => 'Failed to save result record.']);
        }
    }

    public function update(UpdateResultRequest $request, Result $result)
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('image')) {
                if ($result->image_path) {
                    Storage::disk('public')->delete($result->image_path);
                }
                $data['image_path'] = $request->file('image')->store('results', 'public');
            }

            $result->update($data);

            return back()->with(['status' => true, 'message' => 'Result record updated successfully.']);
        } catch (\Throwable $e) {
            Log::error('Failed to update result record', ['message' => $e->getMessage(), 'result_id' => $result->id]);

            return back()->withErrors(['general' => 'Failed to update result record.']);
        }
    }

    public function destroy(Result $result)
    {
        $this->authorize('delete', $result);

        try {
            if ($result->image_path) {
                Storage::disk('public')->delete($result->image_path);
            }
            $result->delete();

            return back()->with(['status' => true, 'message' => 'Result record removed.']);
        } catch (\Throwable $e) {
            Log::error('Failed to delete result record', ['message' => $e->getMessage(), 'result_id' => $result->id]);

            return back()->withErrors(['general' => 'Failed to remove result record.']);
        }
    }
}