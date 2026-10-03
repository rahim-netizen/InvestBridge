<?php

namespace App\Http\Controllers;
use App\Models\ConnectedOpportunity;
use App\Models\Complaint;
use App\Models\Opportunity;
use App\Models\User;
use App\Services\EscrowPayoutService;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * High-level platform counters for the admin dashboard stat cards.
     */
    public function stats()
    {
        return response()->json([
            'stats' => [
                'users' => User::where('role', '!=', 'admin')->count(),
                'activeOpportunities' => Opportunity::whereIn('status', ['active', 'Active'])->count(),
                'connections' => ConnectedOpportunity::count(),
            ],
        ]);
    }

    /**
     * List every non-admin platform user with their post count and founder
     * rating. Posts and the rating count are counted live from their tables
     * so they cannot drift; `rating` is the stored average RatingController
     * recomputes from every rating on each new one.
     */
    public function users()
    {
        $users = User::where('role', '!=', 'admin')
            ->select(['id', 'name', 'email', 'role', 'rating', 'created_at'])
            ->withCount(['opportunities as posts', 'ratingsReceived as ratings_count'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['users' => $users]);
    }

    public function complaints()
    {
        $complaints = Complaint::with('user:id,name,email')
            ->latest()
            ->get();

        return response()->json(['complaints' => $complaints]);
    }

    public function updateComplaint(Request $request, $id)
    {
        $data = $request->validate([
            'feedback' => ['required', 'string', 'max:5000'],
        ]);

        $complaint = Complaint::findOrFail($id);
        $complaint->update([
            'feedback' => $data['feedback'],
            'status' => 'answered',
        ]);

        return response()->json(['complaint' => $complaint]);
    }

    public function destroyUser(Request $request, $id)
    {
        $user = User::where('id', $id)->where('role', '!=', 'admin')->firstOrFail();

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot remove your own account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User removed successfully.']);
    }

    /**
     * List every opportunity ("project") on the platform with its founder.
     */
    public function opportunities()
    {
        $opportunities = Opportunity::with('user:id,name,email')
            ->withCount(['connections as investors_count' => fn ($query) => $query->where('investment_amount', '>', 0)])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['opportunities' => $opportunities]);
    }

    public function updateOpportunityStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:active,suspended'],
        ]);

        $opportunity = Opportunity::findOrFail($id);

        // Suspend/activate only toggles a live post; it must never overwrite a
        // post the founder has already completed back to "active".
        if (strcasecmp((string) $opportunity->status, 'completed') === 0) {
            return response()->json([
                'message' => 'Completed projects cannot be suspended or reactivated.',
            ], 422);
        }

        $opportunity->update($validated);

        return response()->json(['opportunity' => $opportunity]);
    }

    public function destroyOpportunity($id)
    {
        $opportunity = Opportunity::findOrFail($id);
        $opportunity->delete();

        return response()->json(['message' => 'Project removed successfully.']);
    }

    /**
     * Every saved post, so the admin can see which investors are still waiting
     * on a payout and which have already been paid out.
     */
    public function connections()
    {
        $payouts = new EscrowPayoutService();

        $connections = ConnectedOpportunity::with([
            'user:id,name,email',
            'opportunity:id,title,company,user_id,funding_goal',
        ])
            ->orderByDesc('id')
            ->get();

        // Decorate with the live escrow figures so the admin sees what each
        // payout is worth right now without recomputing it in the browser.
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
            $connection->setAttribute('escrow_pot', $payouts->potFor($connection));
        });

        return response()->json(['connections' => $connections]);
    }

}