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
}