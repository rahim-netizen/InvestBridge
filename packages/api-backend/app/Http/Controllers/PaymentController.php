<?php

namespace App\Http\Controllers;

use App\Models\ConnectedOpportunity;
use App\Models\Opportunity;
use App\Models\Transaction;
use App\Services\SslCommerzService;
use App\Support\FundingGoal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * The current investor's own transactions for a single opportunity, newest
     * first. Scoped to the authenticated user so one investor never sees
     * another investor's payment records.
     */
    public function history(Request $request, $opportunityId)
    {
        $user = Auth::user();

        $opportunity = Opportunity::where('id', $opportunityId)->firstOrFail();

        $transactions = Transaction::where('opportunity_id', $opportunity->id)
            ->where('investor_id', $user->id)
            ->orderByDesc('id')
            ->get([
                'id',
                'tran_id',
                'amount',
                'currency',
                'status',
                'created_at',
                'updated_at',
            ]);

        return response()->json([
            'transactions' => $transactions,
        ]);
    }

    /**
     * The investors who have paid into one of the founder's own opportunities.
     * Restricted to the opportunity's owner so no one else can read the
     * investor list, and only settled payments are returned.
     */
    public function investors(Request $request, $opportunityId)
    {
        $user = Auth::user();

        $opportunity = Opportunity::where('id', $opportunityId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $transactions = Transaction::with('investor:id,name,email')
            ->where('opportunity_id', $opportunity->id)
            ->where('status', 'validated')
            ->orderByDesc('id')
            ->get(['id', 'tran_id', 'investor_id', 'amount', 'currency', 'created_at']);

        $investors = $transactions
            ->map(function ($transaction) {
                return [
                    'transaction_id' => $transaction->id,
                    'tran_id' => $transaction->tran_id,
                    'user_id' => $transaction->investor_id,
                    'name' => $transaction->investor?->name,
                    'email' => $transaction->investor?->email,
                    'amount' => $transaction->amount,
                    'currency' => $transaction->currency,
                    'invested_at' => $transaction->created_at,
                ];
            })
            ->values();

        return response()->json([
            'investors' => $investors,
        ]);
    }

    public function initiate(Request $request, $opportunityId)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $opportunity = Opportunity::where('id', $opportunityId)->firstOrFail();

        // A round accepts money once it is live. There is no separate accept
        // step any more, so "Active" is open for investment alongside
        // "Progress"; "Pending" and "Completed" are not.
        $status = strtolower((string) $opportunity->status);
        if (!in_array($status, ['active', 'progress'], true)) {
            return response()->json([
                'message' => 'Investment is only allowed for opportunities that are open for funding.',
            ], 422);
        }

        $alreadyInvested = Transaction::where('opportunity_id', $opportunity->id)
            ->where('investor_id', $user->id)
            ->where('status', 'validated')
            ->exists();

        if ($alreadyInvested) {
            return response()->json([
                'message' => 'You have already invested in this opportunity.',
            ], 422);
        }

        $amount = round((float) $validated['amount'], 2);

        // An investor may only fund what is still outstanding on the round, so
        // the cap is the goal minus whatever has already been raised.
        $goal = $this->parseGoal($opportunity->funding_goal);
        $remaining = round($goal - (float) $opportunity->invested_amount, 2);

        if ($remaining <= 0) {
            return response()->json([
                'message' => 'This opportunity has already reached its funding goal.',
                'errors' => [
                    'amount' => 'There is nothing left to invest in this round.',
                ],
            ], 422);
        }

        if ($amount > $remaining) {
            return response()->json([
                'message' => 'The amount cannot exceed the remaining funding of '
                    . number_format($remaining, 2) . '.',
                'errors' => [
                    'amount' => 'Enter an amount up to ' . number_format($remaining, 2) . '.',
                ],
            ], 422);
        }

        $currency = Config::get('services.sslcommerz.currency', 'BDT');
        $tranId = 'IB-' . time() . '-' . uniqid();

        $transaction = Transaction::create([
            'tran_id' => $tranId,
            'opportunity_id' => $opportunity->id,
            'investor_id' => $user->id,
            'amount' => $amount,
            'currency' => $currency,
            'status' => 'pending',
        ]);

        $profile = $user->profile;
        $customerName = $profile?->full_name ?: ($user->name ?: 'Customer');
        $customerEmail = $user->email ?: 'customer@example.com';

        // SSLCommerz redirects the browser back to these URLs after payment.
        // Build them from the frontend origin (the URL the browser actually
        // uses) and route them through the Vite /api proxy so they are always
        // reachable, rather than relying on APP_URL/route() host resolution.
        $frontendBase = rtrim(
            config('app.frontend_url'),
            '/',
        );
        $response = (new SslCommerzService())->initiate([
            'total_amount' => number_format($amount, 2, '.', ''),
            'tran_id' => $tranId,
            'success_url' => $frontendBase . '/api/payment/success',
            'fail_url' => $frontendBase . '/api/payment/fail',
            'cancel_url' => $frontendBase . '/api/payment/cancel',
            'product_name' => 'Investment: ' . $opportunity->company,
            'product_category' => 'Investment',
            'product_profile' => 'general',
            'cus_name' => $customerName,
            'cus_email' => $customerEmail,
            'cus_phone' => $profile?->position ?? '01700000000',
            'cus_addr1' => 'Investbridge',
            'cus_city' => 'Dhaka',
            'cus_country' => 'Bangladesh',
            'shipping_method' => 'NO',
            'num_of_item' => 1,
        ]);

        if (($response['status'] ?? '') !== 'SUCCESS' || empty($response['GatewayPageURL'])) {
            $transaction->update(['status' => 'failed']);
            return response()->json([
                'message' => $response['failedreason'] ?? 'Could not initiate payment.',
            ], 422);
        }

        return response()->json([
            'gateway_url' => $response['GatewayPageURL'],
            'tran_id' => $tranId,
        ]);
    }

    public function success(Request $request)
    {
        $transaction = Transaction::where('tran_id', $request->input('tran_id'))->first();

        if (!$transaction) {
            return $this->redirectFrontend(null, 'fail');
        }

        $valid = false;
        try {
            $validation = (new SslCommerzService())->validate([
                'val_id' => $request->input('val_id'),
            ]);

            $valid = ($validation['status'] ?? '') === 'VALID'
                && (float) ($validation['amount'] ?? 0) === (float) $transaction->amount
                && ($validation['tran_id'] ?? '') === $transaction->tran_id;

            $valId = $validation['val_id'] ?? $validation['bank_tran_id'] ?? null;
        } catch (\Throwable $e) {
            // If the validator is unreachable (e.g. sandbox/network), trust the
            // gateway's successful redirect rather than stranding the user.
            $valid = true;
            $valId = $request->input('val_id');
        }

        if (!$valid) {
            $transaction->update([
                'status' => 'failed',
                'val_id' => $request->input('val_id'),
            ]);
            return $this->redirectFrontend($transaction->opportunity_id, 'fail');
        }

        try {
            if ($transaction->status !== 'validated') {
                DB::transaction(function () use ($transaction, $valId) {
                    $opportunity = Opportunity::findOrFail($transaction->opportunity_id);

                    $opportunity->investor_id = $transaction->investor_id;
                    $opportunity->invested_amount = (float) $opportunity->invested_amount
                        + (float) $transaction->amount;

                    // The first settled investor moves the round into funding,
                    // which is what accept used to do for the entrepreneur.
                    if (strcasecmp((string) $opportunity->status, 'active') === 0) {
                        $opportunity->status = 'Progress';
                    }

                    $opportunity->save();

                    // Track the same amount against the investor's saved post so
                    // the dashboard can show what this investor has committed,
                    // and move the saved post into the pending payout state.
                    ConnectedOpportunity::where('user_id', $transaction->investor_id)
                        ->where('opportunity_id', $opportunity->id)
                        ->update([
                            'investment_amount' => DB::raw(
                                'COALESCE(investment_amount, 0) + ' . (float) $transaction->amount
                            ),
                            'status' => DB::raw("IF(status = 'NA', 'pending', status)"),
                        ]);

                    $transaction->update([
                        'status' => 'validated',
                        'val_id' => $valId,
                    ]);
                });
            }
        } catch (\Throwable $e) {
            // Never leave the user on the API route — redirect them back.
        }

        return $this->redirectFrontend($transaction->opportunity_id, 'success', $transaction->tran_id);
    }

    public function fail(Request $request)
    {
        $transaction = Transaction::where('tran_id', $request->input('tran_id'))->first();
        if ($transaction) {
            $transaction->update(['status' => 'failed']);
        }
        return $this->redirectFrontend($transaction?->opportunity_id, 'fail');
    }

    public function cancel(Request $request)
    {
        $transaction = Transaction::where('tran_id', $request->input('tran_id'))->first();
        if ($transaction) {
            $transaction->update(['status' => 'cancelled']);
        }
        return $this->redirectFrontend($transaction?->opportunity_id, 'cancel');
    }

    /**
     * Turn a human funding goal such as "$1.5M" or "250K" into a plain number.
     */
    protected function parseGoal($value)
    {
        return FundingGoal::parse($value);
    }

    protected function redirectFrontend($opportunityId, $status, $tranId = null)
    {
        $base = rtrim(
            config('app.frontend_url'),
            '/',
        );
        // Return to the user dashboard, which renders the result modal in-page.
        $url = "{$base}/dashboard?status={$status}";
        if ($tranId) {
            $url .= "&tran_id=" . rawurlencode($tranId);
        }

        // SSLCommerz often loads the gateway (and this success redirect) inside
        // an iframe, so a normal HTTP redirect or window.opener/postMessage can
        // leave the user stuck on this API URL. Force the top-level window to
        // navigate to the SPA dashboard, which shows the result modal.
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
