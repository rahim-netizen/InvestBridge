<?php

namespace App\Http\Controllers;

use App\Models\ConnectedOpportunity;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConnectedOpportunityController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $connections = ConnectedOpportunity::with('opportunity.user')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'connections' => $connections,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'opportunity_id' => ['required', 'integer', 'exists:opportunities,id'],
        ]);

        $opportunity = Opportunity::findOrFail($validated['opportunity_id']);

        if ($opportunity->user_id === $user->id) {
            return response()->json([
                'message' => 'You cannot save your own post.',
            ], 422);
        }

        $connection = ConnectedOpportunity::firstOrCreate([
            'user_id' => $user->id,
            'opportunity_id' => $opportunity->id,
        ]);

        return response()->json([
            'connection' => $connection,
            'message' => 'Saved to your dashboard.',
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $user = Auth::user();

        $connection = ConnectedOpportunity::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $connection->delete();

        return response()->json([
            'message' => 'Removed from your dashboard.',
        ]);
    }

    public function connectionsByOpportunity(Request $request, $id)
    {
        $user = Auth::user();

        $opportunity = Opportunity::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $connections = ConnectedOpportunity::with('user')
            ->where('opportunity_id', $opportunity->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'connections' => $connections->map(function ($connection) {
                return [
                    'id' => $connection->id,
                    'user_id' => $connection->user?->id,
                    'name' => $connection->user?->name,
                    'email' => $connection->user?->email,
                    'connected_at' => $connection->created_at,
                ];
            }),
        ]);
    }

    public function acceptConnection(Request $request, $id)
    {
        $user = Auth::user();

        $opportunity = Opportunity::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'connection_id' => ['required', 'integer'],
        ]);

        $accepted = ConnectedOpportunity::where('opportunity_id', $opportunity->id)
            ->where('id', $validated['connection_id'])
            ->firstOrFail();

        ConnectedOpportunity::where('opportunity_id', $opportunity->id)
            ->where('id', '!=', $accepted->id)
            ->delete();

        $opportunity->update(['status' => 'Active']);

        return response()->json([
            'message' => 'Connection accepted.',
            'accepted_id' => $accepted->id,
            'status' => $opportunity->status,
        ]);
    }
}