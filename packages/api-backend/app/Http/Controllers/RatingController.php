<?php

namespace App\Http\Controllers;

use App\Models\ConnectedOpportunity;
use App\Models\Opportunity;
use App\Models\Rating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Investor ratings for an entrepreneur, unlocked once their post completes.
 *
 * A rating is recorded once per investor per post, and the entrepreneur's
 * stored `users.rating` is refreshed from the full set of ratings rather than
 * blended against the previous value, so the stored figure stays a true mean
 * no matter how many ratings arrive.
 */
class RatingController extends Controller
{
    /**
     * Whether the current investor may rate this post's founder right now, and
     * what they have already given. Used to drive the UI.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        $opportunity = Opportunity::findOrFail($id);

        $isInvestor = ConnectedOpportunity::where('opportunity_id', $opportunity->id)
            ->where('user_id', $user->id)
            ->where('investment_amount', '>', 0)
            ->exists();

        $existing = Rating::where('opportunity_id', $opportunity->id)
            ->where('investor_id', $user->id)
            ->first();

        return response()->json([
            'can_rate' => $this->canRate($user->id, $opportunity, $isInvestor, (bool) $existing),
            'is_investor' => $isInvestor,
            'already_rated' => (bool) $existing,
            'my_rating' => $existing?->rating,
            'entrepreneur_rating' => (float) ($opportunity->user?->rating ?? 0),
            'rating_count' => Rating::where('entrepreneur_id', $opportunity->user_id)->count(),
        ]);
    }

    /**
     * Public feed of the latest real ratings for the homepage "Success
     * stories" section. Only names, avatars, the project and the score are
     * exposed - never e-mails or amounts.
     */
    public function recent(): JsonResponse
    {
        $ratings = Rating::with(['investor.profile', 'entrepreneur', 'opportunity'])
            ->latest()
            ->take(6)
            ->get()
            ->filter(fn ($rating) => $rating->investor && $rating->opportunity)
            ->map(fn ($rating) => [
                'id' => $rating->id,
                'rating' => $rating->rating,
                'investor' => [
                    'name' => $rating->investor->profile?->full_name ?: $rating->investor->name,
                    'avatar' => $rating->investor->profile?->profile_image ?: $rating->investor->avatar,
                ],
                'entrepreneur' => $rating->entrepreneur?->name,
                'opportunity' => [
                    'title' => $rating->opportunity->title,
                    'company' => $rating->opportunity->company,
                    'sector' => $rating->opportunity->sector,
                ],
                'rated_at' => $rating->created_at?->toIso8601String(),
            ])
            ->values();

        return response()->json(['ratings' => $ratings]);
    }

    /**
     * Record a rating and refresh the entrepreneur's average.
     */
    public function store(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        $user = Auth::user();
        $opportunity = Opportunity::findOrFail($id);

        $isInvestor = ConnectedOpportunity::where('opportunity_id', $opportunity->id)
            ->where('user_id', $user->id)
            ->where('investment_amount', '>', 0)
            ->exists();

        $existing = Rating::where('opportunity_id', $opportunity->id)
            ->where('investor_id', $user->id)
            ->first();

        if (! $this->canRate($user->id, $opportunity, $isInvestor, (bool) $existing)) {
            return response()->json([
                'message' => $this->ratingRefusal($user->id, $opportunity, $isInvestor, (bool) $existing),
            ], 422);
        }

        try {
            // The unique index on (investor_id, opportunity_id) is the real
            // guard against a double submit, so let it decide the winner.
            $rating = Rating::create([
                'opportunity_id' => $opportunity->id,
                'entrepreneur_id' => $opportunity->user_id,
                'investor_id' => $user->id,
                'rating' => $validated['rating'],
            ]);
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            return response()->json([
                'message' => 'You have already rated this founder for this post.',
            ], 422);
        }

        $average = $this->refreshAverage($opportunity->user_id);

        return response()->json([
            'message' => 'Thanks for rating this founder.',
            'rating' => $rating,
            'entrepreneur_rating' => $average,
        ], 201);
    }

    /**
     * Recompute the entrepreneur's average from every rating they have
     * received and store it on the user.
     *
     * Blending the new score against the stored value would drift badly over
     * time: after 2 ratings a true mean of 5.0 and 1.0 is 3.0, but a third
     * score of 5.0 averaged against that stored 3.0 would give 4.0 instead of
     * the correct 3.67. Recomputing from the rows keeps it exact.
     */
    protected function refreshAverage(int $entrepreneurId): float
    {
        $stats = Rating::where('entrepreneur_id', $entrepreneurId)
            ->selectRaw('COUNT(*) as total, COALESCE(SUM(rating), 0) as sum')
            ->first();

        $total = (int) ($stats->total ?? 0);
        $average = $total > 0 ? round((float) $stats->sum / $total, 2) : 0.0;

        DB::table('users')->where('id', $entrepreneurId)->update(['rating' => $average]);

        return $average;
    }

    /**
     * All four conditions must hold: the viewer funded this post, the post has
     * completed, it is not their own post, and they have not rated it yet.
     */
    protected function canRate(int $userId, Opportunity $opportunity, bool $isInvestor, bool $alreadyRated): bool
    {
        if (! $isInvestor) {
            return false;
        }
        if (strcasecmp((string) $opportunity->status, 'completed') !== 0) {
            return false;
        }
        if ((int) $opportunity->user_id === $userId) {
            return false;
        }
        if ($alreadyRated) {
            return false;
        }

        return true;
    }

    protected function ratingRefusal(int $userId, Opportunity $opportunity, bool $isInvestor, bool $alreadyRated): string
    {
        if (! $isInvestor) {
            return 'Only investors in this post can rate its founder.';
        }
        if ((int) $opportunity->user_id === $userId) {
            return 'You cannot rate your own post.';
        }
        if (strcasecmp((string) $opportunity->status, 'completed') !== 0) {
            return 'You can rate this founder once the post is completed.';
        }

        return 'You have already rated this founder for this post.';
    }
}