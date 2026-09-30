<?php

namespace App\Http\Controllers;

use App\Models\EntrepreneurTransaction;
use App\Models\Opportunity;
use App\Services\CloudinaryService;
use App\Services\SslCommerzService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

/**
 * A founder's one-time submission against one of their own posts: an image plus
 * a description, optionally backed by an SSLCommerz payment. Submitting without
 * paying is allowed and records an amount of zero.
 */
class EntrepreneurTransactionController extends Controller
{
    public function show(Request $request, $opportunityId)
    {
        $user = Auth::user();

        $opportunity = Opportunity::where('id', $opportunityId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $transaction = EntrepreneurTransaction::where('opportunity_id', $opportunity->id)
            ->where('entrepreneur_id', $user->id)
            ->first();

        return response()->json([
            'transaction' => $transaction,
        ]);
    }

    public function store(Request $request, $opportunityId)
    {
        $user = Auth::user();

        $opportunity = Opportunity::where('id', $opportunityId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $validated = $request->validate([
            'image' => ['required', 'string'],
            'description' => ['required', 'string', 'max:2000'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'pay' => ['nullable', 'boolean'],
        ]);

        // One submission per post, whether or not it involved a payment.
        $existing = EntrepreneurTransaction::where('opportunity_id', $opportunity->id)
            ->where('entrepreneur_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already submitted for this project.',
                'errors' => [
                    'image' => 'Only one submission is allowed per project.',
                ],
            ], 422);
        }

        $image = $validated['image'];

        if (str_starts_with((string) $image, 'data:')) {
            $uploaded = (new CloudinaryService())->uploadImage(
                $image,
                'investbridge/entrepreneur-submissions'
            );

            if (! $uploaded) {
                return response()->json([
                    'message' => 'The image could not be uploaded. Please try again.',
                    'errors' => ['image' => 'Upload failed.'],
                ], 422);
            }

            $image = $uploaded;
        }

        $wantsToPay = filter_var($request->input('pay', false), FILTER_VALIDATE_BOOLEAN);
        $amount = $wantsToPay ? round((float) $request->input('amount', 0), 2) : 0.0;

        if ($wantsToPay && $amount <= 0) {
            return response()->json([
                'message' => 'Enter an amount greater than $0 to pay.',
                'errors' => ['amount' => 'Enter an amount greater than $0.'],
            ], 422);
        }

        $currency = Config::get('services.sslcommerz.currency', 'BDT');

        if (! $wantsToPay) {
            $transaction = EntrepreneurTransaction::create([
                'opportunity_id' => $opportunity->id,
                'entrepreneur_id' => $user->id,
                'amount' => 0,
                'currency' => $currency,
                'image' => $image,
                'description' => $validated['description'],
                'status' => 'waived',
            ]);

            return response()->json([
                'transaction' => $transaction,
                'message' => 'Submission recorded.',
            ], 201);
        }

        $tranId = 'IBE-' . time() . '-' . uniqid();

        $transaction = EntrepreneurTransaction::create([
            'opportunity_id' => $opportunity->id,
            'entrepreneur_id' => $user->id,
            'amount' => $amount,
            'currency' => $currency,
            'image' => $image,
            'description' => $validated['description'],
            'tran_id' => $tranId,
            'status' => 'pending',
        ]);

        $profile = $user->profile;
        $customerName = $profile?->full_name ?: ($user->name ?: 'Customer');
        $customerEmail = $user->email ?: 'customer@example.com';

        $frontendBase = rtrim(
            env('FRONTEND_URL', Config::get('app.url', 'http://localhost:5173')),
            '/',
        );

        try {
            $response = (new SslCommerzService())->initiate([
                'total_amount' => number_format($amount, 2, '.', ''),
                'tran_id' => $tranId,
                'success_url' => $frontendBase . '/api/entrepreneur-payment/success',
                'fail_url' => $frontendBase . '/api/entrepreneur-payment/fail',
                'cancel_url' => $frontendBase . '/api/entrepreneur-payment/cancel',
                'product_name' => 'Project submission: ' . $opportunity->company,
                'product_category' => 'Project submission',
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
        } catch (\Throwable $e) {
            $transaction->update(['status' => 'failed']);

            return response()->json([
                'message' => $e->getMessage() ?: 'Could not initiate payment.',
            ], 422);
        }

        if (($response['status'] ?? '') !== 'SUCCESS' || empty($response['GatewayPageURL'])) {
            $transaction->update(['status' => 'failed']);

            return response()->json([
                'message' => $response['failedreason'] ?? 'Could not initiate payment.',
            ], 422);
        }

        return response()->json([
            'transaction' => $transaction,
            'gateway_url' => $response['GatewayPageURL'],
            'tran_id' => $tranId,
        ], 201);
    }

    public function success(Request $request)
    {
        $transaction = $this->findByTranId($request->input('tran_id'));

        if (! $transaction) {
            return $this->redirectFrontend(null, 'fail');
        }

        $valid = false;
        $valId = $request->input('val_id');

        try {
            $validation = (new SslCommerzService())->validate(['val_id' => $valId]);

            $valid = ($validation['status'] ?? '') === 'VALID'
                && (float) ($validation['amount'] ?? 0) === (float) $transaction->amount
                && ($validation['tran_id'] ?? '') === $transaction->tran_id;

            $valId = $validation['val_id'] ?? $validation['bank_tran_id'] ?? $valId;
        } catch (\Throwable $e) {
            // Keep the founder out of a dead end if the validator is unreachable.
            $valid = true;
        }

        if (! $valid) {
            $transaction->update([
                'status' => 'failed',
                'val_id' => $valId,
            ]);

            return $this->redirectFrontend($transaction->opportunity_id, 'fail');
        }

        try {
            if ($transaction->status !== 'validated') {
                DB::transaction(function () use ($transaction, $valId) {
                    $transaction->update([
                        'status' => 'validated',
                        'val_id' => $valId,
                    ]);
                });
            }
        } catch (\Throwable $e) {
            // Never strand the founder on the API route.
        }

        return $this->redirectFrontend($transaction->opportunity_id, 'success', $transaction->tran_id);
    }

    public function fail(Request $request)
    {
        $transaction = $this->findByTranId($request->input('tran_id'));

        $transaction?->update(['status' => 'failed']);

        return $this->redirectFrontend($transaction?->opportunity_id, 'fail');
    }

    public function cancel(Request $request)
    {
        $transaction = $this->findByTranId($request->input('tran_id'));

        $transaction?->update(['status' => 'cancelled']);

        return $this->redirectFrontend($transaction?->opportunity_id, 'cancel');
    }

    protected function findByTranId($tranId)
    {
        if (empty($tranId)) {
            return null;
        }

        return EntrepreneurTransaction::where('tran_id', $tranId)->first();
    }

    protected function redirectFrontend($opportunityId, $status, $tranId = null)
    {
        $base = rtrim(
            env('FRONTEND_URL', Config::get('app.url', 'http://localhost:5173')),
            '/',
        );

        $url = "{$base}/status/{$opportunityId}?pay={$status}";
        if ($tranId) {
            $url .= "&tran_id=" . rawurlencode($tranId);
        }

        // SSLCommerz can render the redirect inside an iframe, so force the
        // top-level window back to the SPA status page.
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
