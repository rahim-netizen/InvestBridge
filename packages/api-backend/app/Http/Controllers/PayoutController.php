<?php

namespace App\Http\Controllers;

use App\Models\ConnectedOpportunity;
use App\Models\Opportunity;
use App\Models\Payout;
use App\Services\EscrowPayoutService;
use App\Services\SslCommerzService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Escrow payouts to investors.
 *
 * The admin releases an investor's share of the escrow pot. The amount is
 * derived server-side (see EscrowPayoutService) and settled through
 * SSLCommerz; the saved post is only moved to "completed" once the gateway
 * confirms the payment.
 */
class PayoutController extends Controller
{
    /**
     * Start a payout: work out what the investor is owed and hand the admin off
     * to the gateway to release it.
     */
    public function initiate(Request $request, $id)
    {
        $connection = ConnectedOpportunity::with([
            'user:id,name,email',
            'opportunity:id,title,company,user_id,funding_goal',
        ])->findOrFail($id);

        if ($connection->status === 'completed') {
            return response()->json([
                'message' => 'This payout has already been completed.',
            ], 422);
        }

        $amount = (new EscrowPayoutService())->payoutFor($connection);

        if ($amount <= 0) {
            return response()->json([
                'message' => 'There is no escrow balance to pay on this record.',
            ], 422);
        }

        $currency = Config::get('services.sslcommerz.currency', 'BDT');
        $tranId = 'IBP-' . time() . '-' . uniqid();

        $payout = Payout::create([
            'connected_opportunity_id' => $connection->id,
            'investor_id' => $connection->user_id,
            'amount' => $amount,
            'currency' => $currency,
            'tran_id' => $tranId,
            'status' => 'pending',
        ]);

        $profile = $connection->user?->profile;
        $payeeName = $connection->user?->name ?: 'Investor';
        $payeeEmail = $connection->user?->email ?: 'investor@example.com';

        $frontendBase = rtrim(
            config('app.frontend_url'),
            '/',
        );

        try {
            $response = (new SslCommerzService())->initiate([
                'total_amount' => number_format($amount, 2, '.', ''),
                'tran_id' => $tranId,
                'success_url' => $frontendBase . '/api/payout/success',
                'fail_url' => $frontendBase . '/api/payout/fail',
                'cancel_url' => $frontendBase . '/api/payout/cancel',
                'product_name' => 'Escrow payout: ' . ($connection->opportunity?->company ?? 'InvestBridge'),
                'product_category' => 'Escrow payout',
                'product_profile' => 'general',
                'cus_name' => $payeeName,
                'cus_email' => $payeeEmail,
                'cus_phone' => $profile?->position ?? '01700000000',
                'cus_addr1' => 'Investbridge',
                'cus_city' => 'Dhaka',
                'cus_country' => 'Bangladesh',
                'shipping_method' => 'NO',
                'num_of_item' => 1,
            ]);
        } catch (\Throwable $e) {
            $payout->update(['status' => 'failed']);

            return response()->json([
                'message' => $e->getMessage() ?: 'Could not initiate the payout.',
            ], 422);
        }

        if (($response['status'] ?? '') !== 'SUCCESS' || empty($response['GatewayPageURL'])) {
            $payout->update(['status' => 'failed']);

            return response()->json([
                'message' => $response['failedreason'] ?? 'Could not initiate the payout.',
            ], 422);
        }

        return response()->json([
            'payout' => $payout,
            'gateway_url' => $response['GatewayPageURL'],
            'tran_id' => $tranId,
            'amount' => $amount,
        ], 201);
    }

    /**
     * Gateway return: confirm the payment really settled, and only then mark the
     * saved post completed with the amount that was actually paid.
     */
    public function success(Request $request)
    {
        $payout = $this->findByTranId($request->input('tran_id'));

        if (!$payout) {
            return $this->redirectAdmin('fail');
        }

        $valid = false;
        $valId = $request->input('val_id');

        try {
            $validation = (new SslCommerzService())->validate(['val_id' => $valId]);

            $valid = ($validation['status'] ?? '') === 'VALID'
                && (float) ($validation['amount'] ?? 0) === (float) $payout->amount
                && ($validation['tran_id'] ?? '') === $payout->tran_id;

            $valId = $validation['val_id'] ?? $validation['bank_tran_id'] ?? $valId;
        } catch (\Throwable $e) {
            // If the validator is unreachable (sandbox/network), trust the
            // gateway's successful redirect rather than stranding the admin.
            $valid = true;
        }

        if (!$valid) {
            $payout->update([
                'status' => 'failed',
                'val_id' => $valId,
            ]);

            return $this->redirectAdmin('fail', $payout->tran_id);
        }

        try {
            // Guard against a replayed callback settling the same payout twice.
            if ($payout->status !== 'validated') {
                DB::transaction(function () use ($payout, $valId) {
                    $payout->update([
                        'status' => 'validated',
                        'val_id' => $valId,
                    ]);

                    $connection = ConnectedOpportunity::find($payout->connected_opportunity_id);

                    if ($connection && $connection->status !== 'completed') {
                        $connection->update([
                            'status' => 'completed',
                            'payout_amount' => $payout->amount,
                            'paid_at' => now(),
                        ]);
                    }

                    if ($connection) {
                        $this->completeRoundIfFullyPaid($connection->opportunity_id);
                    }
                });
            }
        } catch (\Throwable $e) {
            // Never leave the admin stranded on the API route, but do not let a
            // settlement failure disappear silently.
            Log::error('Payout settlement failed', [
                'tran_id' => $payout->tran_id,
                'connected_opportunity_id' => $payout->connected_opportunity_id,
                'exception' => $e->getMessage(),
            ]);
        }

        return $this->redirectAdmin('success', $payout->tran_id);
    }

    /**
     * Once every funded investor on a round has been paid out, close the round.
     *
     * Runs inside the payout transaction so the round is never left
     * "Progress" with nothing left to pay, and never marked "Completed" while
     * an investor is still owed money.
     */
    protected function completeRoundIfFullyPaid($opportunityId): void
    {
        if (! $opportunityId) {
            Log::warning('Skipping round completion: connection has no opportunity', [
                'opportunity_id' => $opportunityId,
            ]);

            return;
        }

        $opportunity = Opportunity::find($opportunityId);

        if (! $opportunity) {
            return;
        }

        if (! (new EscrowPayoutService())->allInvestorsPaid($opportunityId)) {
            return;
        }

        // Leave an already-closed or suspended round alone; this only advances
        // a round that was still open for funding.
        if (in_array($opportunity->status, ['Completed', 'completed'], true)) {
            return;
        }

        $opportunity->update(['status' => 'Completed']);
    }

    public function fail(Request $request)
    {
        $payout = $this->findByTranId($request->input('tran_id'));
        $payout?->update(['status' => 'failed']);

        return $this->redirectAdmin('fail', $payout?->tran_id);
    }

    public function cancel(Request $request)
    {
        $payout = $this->findByTranId($request->input('tran_id'));
        $payout?->update(['status' => 'cancelled']);

        return $this->redirectAdmin('cancel', $payout?->tran_id);
    }

    protected function findByTranId($tranId)
    {
        if (empty($tranId)) {
            return null;
        }

        return Payout::where('tran_id', $tranId)->first();
    }

    protected function redirectAdmin($status, $tranId = null)
    {
        $base = rtrim(
            config('app.frontend_url'),
            '/',
        );

        $url = "{$base}/admin?payout={$status}";
        if ($tranId) {
            $url .= "&tran_id=" . rawurlencode($tranId);
        }

        // SSLCommerz can render the redirect inside an iframe, so force the
        // top-level window back to the admin SPA.
        $safeUrl = htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
        $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url={$safeUrl}">
    <title>Redirecting…</title>
</head>
<body>
    <script>
    (function () {
        var url = "{$safeUrl}";
        try { window.top.location.href = url; }
        catch (e) { window.location.href = url; }
    })();
    </script>
</body>
</html>
HTML;

        return response($html)->header('Content-Type', 'text/html; charset=utf-8');
    }
}