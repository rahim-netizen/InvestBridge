<?php

namespace App\Http\Controllers;

use App\Models\ConnectedOpportunity;
use App\Models\Opportunity;
use App\Services\EscrowPayoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConnectedOpportunityController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $connections = ConnectedOpportunity::with([
            'opportunity.user.profile',
        ])
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        $payouts = new EscrowPayoutService();

        // Attach the escrow figures so the investor can see what their slice of
        // the founder's escrow pot is worth and how far the payout has got,
        // without having to recompute the split in the browser.
        $connections->each(function ($connection) use ($payouts) {
            $connection->setAttribute(
                'payout_amount',
                $connection->payout_amount !== null
                    ? (float) $connection->payout_amount
                    : $payouts->payoutFor($connection),
            );
            $connection->setAttribute(
                'investor_share',
                round($payouts->investorShare($connection) * 100, 2),
            );
        });

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
            'connections' => $connections->map(function ($connection) use ($opportunity) {
                return [
                    'id' => $connection->id,
                    'user_id' => $connection->user?->id,
                    'name' => $connection->user?->name,
                    'email' => $connection->user?->email,
                    'connected_at' => $connection->created_at,
                    // What this investor has committed to the round, and where
                    // their escrow payout stands.
                    'investment_amount' => $connection->investment_amount,
                    'status' => $connection->status,
                ];
            }),
        ]);
    }
}