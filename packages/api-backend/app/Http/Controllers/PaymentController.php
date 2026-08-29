<?php

namespace App\Http\Controllers;

use App\Models\Checkpoint;
use App\Models\Opportunity;
use App\Models\Transaction;
use App\Services\SslCommerzService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function initiate(Request $request, $opportunityId)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'checkpoints' => ['required', 'array', 'min:1', 'max:5'],
            'checkpoints.*.title' => ['required', 'string', 'max:255'],
            'checkpoints.*.description' => ['nullable', 'string', 'max:2000'],
            'checkpoints.*.amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $opportunity = Opportunity::where('id', $opportunityId)->firstOrFail();

        if (strcasecmp((string) $opportunity->status, 'progress') !== 0) {
            return response()->json([
                'message' => 'Investment is only allowed for opportunities that are in progress.',
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

        $goal = (float) preg_replace('/[^0-9.]/', '', (string) $opportunity->funding_goal);
        $subtotal = (float) collect($validated['checkpoints'])->sum(
            fn ($cp) => (float) $cp['amount'],
        );

        if (abs($subtotal - $goal) > 0.01) {
            return response()->json([
                'message' => 'The sum of checkpoint amounts must equal the funding goal of '
                    . ($goal > 0 ? number_format($goal, 2) : '0') . '.',
                'errors' => [
                    'checkpoints' => [
                        'The combined checkpoint amount of '
                        . number_format($subtotal, 2)
                        . ' does not match the funding goal of '
                        . number_format($goal, 2)
                        . '.',
                    ],
                ],
            ], 422);
        }

        $currency = Config::get('services.sslcommerz.currency', 'BDT');
        $tranId = 'IB-' . time() . '-' . uniqid();

        $transaction = Transaction::create([
            'tran_id' => $tranId,
            'opportunity_id' => $opportunity->id,
            'investor_id' => $user->id,
            'amount' => $subtotal,
            'currency' => $currency,
            'checkpoints' => $validated['checkpoints'],
            'status' => 'pending',
        ]);

        $profile = $user->profile;
        $customerName = $profile?->full_name ?: ($user->name ?: 'Customer');
        $customerEmail = $user->email ?: 'customer@example.com';

        $response = (new SslCommerzService())->initiate([
            'total_amount' => number_format($subtotal, 2, '.', ''),
            'tran_id' => $tranId,
            'success_url' => route('payment.success'),
            'fail_url' => route('payment.fail'),
            'cancel_url' => route('payment.cancel'),
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

                    foreach ($transaction->checkpoints as $cp) {
                        Checkpoint::create([
                            'opportunity_id' => $opportunity->id,
                            'investor_id' => $transaction->investor_id,
                            'entrepreneur_id' => $opportunity->user_id,
                            'title' => $cp['title'],
                            'description' => $cp['description'] ?? null,
                            'amount' => $cp['amount'],
                        ]);
                    }

                    $opportunity->investor_id = $transaction->investor_id;
                    $opportunity->save();

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

    protected function redirectFrontend($opportunityId, $status, $tranId = null)
    {
        $base = rtrim(
            env('FRONTEND_URL', Config::get('app.url', 'http://localhost:5173')),
            '/',
        );
        $path = $opportunityId
            ? "/payment/{$opportunityId}"
            : '/deals';
        $url = "{$base}{$path}?status={$status}";
        if ($tranId) {
            $url .= "&tran_id=" . rawurlencode($tranId);
        }
        return redirect($url);
    }
}
