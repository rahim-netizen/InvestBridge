<?php

namespace App\Http\Controllers;
use App\Models\ConnectedOpportunity;
use App\Models\Complaint;
use App\Models\Opportunity;
use App\Models\User;
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
                'activeOpportunities' => Opportunity::where('status', 'active')->count(),
                'connections' => ConnectedOpportunity::count(),
            ],
        ]);
    }

    /**
     * List every non-admin platform user.
     */
    public function users()
    {
        $users = User::where('role', '!=', 'admin')
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'email', 'role', 'created_at']);

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
        $opportunity->update($validated);

        return response()->json(['opportunity' => $opportunity]);
    }

    public function destroyOpportunity($id)
    {
        $opportunity = Opportunity::findOrFail($id);
        $opportunity->delete();

        return response()->json(['message' => 'Project removed successfully.']);
    }

}