<?php

namespace App\Http\Controllers;

use App\Models\ConnectedOpportunity;
use App\Models\Opportunity;

class StatsController extends Controller
{
    /**
     * Public, unauthenticated platform stats for marketing surfaces (the homepage
     * hero counters). Derived from real rows rather than hard-coded copy:
     *  - "funded" opportunities are ones with at least one investor connection
     *  - "active investors" are distinct users who have connected to a deal
     *  - "capital deployed" sums the funding goal of funded opportunities
     *  - "success rate" is funded opportunities / total opportunities
     */
    public function index()
    {
        $totalOpportunities = Opportunity::count();

        $fundedOpportunityIds = ConnectedOpportunity::query()
            ->distinct()
            ->pluck('opportunity_id');

        $activeInvestors = ConnectedOpportunity::query()->distinct('user_id')->count('user_id');

        $totalCapitalDeployed = Opportunity::whereIn('id', $fundedOpportunityIds)
            ->pluck('funding_goal')
            ->sum(fn ($value) => $this->parseAmount($value));

        $successRate = $totalOpportunities > 0
            ? (int) round(($fundedOpportunityIds->count() / $totalOpportunities) * 100)
            : 0;

        return response()->json([
            'stats' => [
                'totalCapitalDeployed' => $totalCapitalDeployed,
                'startupsFunded' => $fundedOpportunityIds->count(),
                'activeInvestors' => $activeInvestors,
                'successRate' => $successRate,
            ],
        ]);
    }

    /**
     * Best-effort parse of free-text funding goals like "$1.5M", "500K", or
     * "2,000,000" into a plain dollar amount. Unparseable values count as 0.
     */
    private function parseAmount(?string $raw): float
    {
        if (!$raw) {
            return 0.0;
        }

        if (!preg_match('/([\d,]*\.?\d+)\s*([kKmMbB]?)/', $raw, $matches) || $matches[1] === '') {
            return 0.0;
        }

        $number = (float) str_replace(',', '', $matches[1]);
        $multiplier = match (strtolower($matches[2])) {
            'k' => 1_000,
            'm' => 1_000_000,
            'b' => 1_000_000_000,
            default => 1,
        };

        return $number * $multiplier;
    }
}
