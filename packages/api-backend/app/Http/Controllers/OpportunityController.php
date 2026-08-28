<?php

namespace App\Http\Controllers;

use App\Models\Opportunity;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OpportunityController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $opportunities = Opportunity::with('user')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'opportunities' => $opportunities,
            'user' => $user,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'company' => ['required', 'string', 'max:255'],
            'sector' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'funding_goal' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'timeline' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string'],
        ]);

        if (!empty($validated['image']) && str_starts_with((string) $validated['image'], 'data:')) {
            $uploaded = (new CloudinaryService())->uploadImage($validated['image'], 'investbridge/opportunities');
            if ($uploaded) {
                $validated['image'] = $uploaded;
            }
        }

        $opportunity = Opportunity::create([
            'user_id' => $user->id,
            ...$validated,
        ]);

        return response()->json([
            'opportunity' => $opportunity,
            'user' => $user,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $user = Auth::user();

        $opportunity = Opportunity::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'opportunity' => $opportunity,
            'user' => $user,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $opportunity = Opportunity::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'company' => ['required', 'string', 'max:255'],
            'sector' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'funding_goal' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'timeline' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string'],
        ]);

        if (!empty($validated['image']) && str_starts_with((string) $validated['image'], 'data:')) {
            $uploaded = (new CloudinaryService())->uploadImage($validated['image'], 'investbridge/opportunities');
            if ($uploaded) {
                $validated['image'] = $uploaded;
            }
        }

        $opportunity->update($validated);

        return response()->json([
            'opportunity' => $opportunity,
            'user' => $user,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = Auth::user();

        $opportunity = Opportunity::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $opportunity->delete();

        return response()->json([
            'message' => 'Opportunity removed successfully.',
            'user' => $user,
        ]);
    }

    public function all(Request $request)
    {
        $opportunities = Opportunity::with('user')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'opportunities' => $opportunities,
        ]);
    }
}
