<?php

namespace App\Services;

use App\Models\ConnectedOpportunity;
use App\Models\EntrepreneurTransaction;
use App\Support\FundingGoal;

/**
 * Escrow payouts.
 *
 * Money flows investor -> platform -> entrepreneur. An entrepreneur funds a
 * submission through SSLCommerz; that settled amount is the escrow pot held on
 * behalf of the round. Each investor's payout is that pot scaled by the slice
 * of the funding goal the investor actually covered, so the sum of all payouts
 * can never exceed the pot that was collected.
 */
class EscrowPayoutService
{
    /**
     * The total the entrepreneur has settled into escrow for this round. Only
     * validated transactions count; pending, failed and cancelled ones are not
     * real money.
     */
    public function potFor(ConnectedOpportunity $connection): float
    {
        return (float) EntrepreneurTransaction::where(
            'opportunity_id',
            $connection->opportunity_id,
        )
            ->where('status', 'validated')
            ->sum('amount');
    }

    /**
     * The slice of the funding goal this investor covered, as a 0-1 fraction.
     */
    public function investorShare(ConnectedOpportunity $connection): float
    {
        $invested = (float) $connection->investment_amount;

        if ($invested <= 0) {
            return 0.0;
        }

        $goal = FundingGoal::parse($connection->opportunity?->funding_goal);

        if ($goal <= 0) {
            return 0.0;
        }

        // An over-funded round would otherwise hand back a share above 1.
        return min(1.0, $invested / $goal);
    }

    /**
     * What the platform owes this investor out of escrow.
     */
    public function payoutFor(ConnectedOpportunity $connection): float
    {
        $pot = $this->potFor($connection);
        $share = $this->investorShare($connection);

        if ($pot <= 0 || $share <= 0) {
            return 0.0;
        }

        return round($pot * $share, 2);
    }
}
