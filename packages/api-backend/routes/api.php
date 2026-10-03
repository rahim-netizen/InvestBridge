<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\SupportController;

Route::get('/auth/google/config', [\App\Http\Controllers\Auth\GoogleAuthController::class, 'config']);
// The redirect and callback are the only routes that need a session, and it is
// there purely to hold the CSRF `state` value across the Google round trip.
Route::middleware('web')->group(function () {
    Route::get('/auth/google/redirect', [\App\Http\Controllers\Auth\GoogleAuthController::class, 'redirect']);
    Route::get('/auth/google/callback', [\App\Http\Controllers\Auth\GoogleAuthController::class, 'callback']);
});
Route::post('/auth/google/handoff', [\App\Http\Controllers\Auth\GoogleAuthController::class, 'handoff']);

Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/email/resend-verification', [EmailVerificationNotificationController::class, 'store']);
Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['signed:relative', 'throttle:6,1'])
    ->name('api.verification.verify');

Route::get('/opportunities/all', [\App\Http\Controllers\OpportunityController::class, 'all']);
Route::get('/stats', [\App\Http\Controllers\StatsController::class, 'index']);

// Deployment check: REVISION is written by the CI deploy job with the commit SHA.
Route::get('/health', function () {
    $revision = base_path('REVISION');

    return response()->json([
        'status' => 'ok',
        'commit' => is_file($revision) ? trim(file_get_contents($revision)) : 'unknown',
        'deployed_at' => is_file($revision) ? date(DATE_ATOM, filemtime($revision)) : null,
        'time' => now()->toIso8601String(),
    ]);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        $user->setRelation('profile', $user->profile);
        return $user;
    });
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    // Investor/founder-only features — the admin account is confined to /api/admin/*.
    Route::middleware(['not-admin'])->group(function () {
        Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'show']);
        Route::put('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);

        Route::get('/opportunities', [\App\Http\Controllers\OpportunityController::class, 'index']);
        Route::post('/opportunities', [\App\Http\Controllers\OpportunityController::class, 'store']);
        Route::get('/opportunities/{id}', [\App\Http\Controllers\OpportunityController::class, 'show']);
        Route::put('/opportunities/{id}', [\App\Http\Controllers\OpportunityController::class, 'update']);
        Route::delete('/opportunities/{id}', [\App\Http\Controllers\OpportunityController::class, 'destroy']);

        Route::get('/connected-opportunities', [\App\Http\Controllers\ConnectedOpportunityController::class, 'index']);
        Route::post('/connected-opportunities', [\App\Http\Controllers\ConnectedOpportunityController::class, 'store']);
        Route::delete('/connected-opportunities/{id}', [\App\Http\Controllers\ConnectedOpportunityController::class, 'destroy']);
        Route::get('/opportunities/{id}/connections', [\App\Http\Controllers\ConnectedOpportunityController::class, 'connectionsByOpportunity']);
        Route::get('/opportunities/{id}/rating', [\App\Http\Controllers\RatingController::class, 'show']);
        Route::post('/opportunities/{id}/rating', [\App\Http\Controllers\RatingController::class, 'store']);

        Route::get('/opportunities/{id}/checkpoints', [\App\Http\Controllers\CheckpointController::class, 'index']);
        Route::post('/opportunities/{id}/checkpoints', [\App\Http\Controllers\CheckpointController::class, 'store']);
        Route::post('/opportunities/{id}/pay', [\App\Http\Controllers\PaymentController::class, 'initiate']);
        Route::get('/opportunities/{id}/transactions', [\App\Http\Controllers\PaymentController::class, 'history']);
        Route::get('/opportunities/{id}/investors', [\App\Http\Controllers\PaymentController::class, 'investors']);

        Route::get('/opportunities/{id}/entrepreneur-transaction', [\App\Http\Controllers\EntrepreneurTransactionController::class, 'show']);
        Route::post('/opportunities/{id}/entrepreneur-transaction', [\App\Http\Controllers\EntrepreneurTransactionController::class, 'store']);
        Route::get('/complaints', [SupportController::class, 'complaints']);
        Route::post('/complaints', [SupportController::class, 'createComplaint']);
        Route::get('/users/search', [SupportController::class, 'searchUsers']);
        Route::get('/chat/{chatHash}', [SupportController::class, 'messages']);
        Route::post('/chat/{chatHash}', [SupportController::class, 'sendMessage']);
    });

    Route::middleware(['admin'])->prefix('admin')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\AdminController::class, 'stats']);
        Route::get('/users', [\App\Http\Controllers\AdminController::class, 'users']);
        Route::get('/complaints', [\App\Http\Controllers\AdminController::class, 'complaints']);
        Route::patch('/complaints/{id}', [\App\Http\Controllers\AdminController::class, 'updateComplaint']);
        Route::delete('/users/{id}', [\App\Http\Controllers\AdminController::class, 'destroyUser']);
        Route::get('/opportunities', [\App\Http\Controllers\AdminController::class, 'opportunities']);
        Route::patch('/opportunities/{id}/status', [\App\Http\Controllers\AdminController::class, 'updateOpportunityStatus']);
        Route::delete('/opportunities/{id}', [\App\Http\Controllers\AdminController::class, 'destroyOpportunity']);
        Route::get('/connections', [\App\Http\Controllers\AdminController::class, 'connections']);
        Route::post('/connections/{id}/payout', [\App\Http\Controllers\PayoutController::class, 'initiate']);
    });
});

// The gateway redirects the admin's browser straight back here after paying, so
// these must stay outside auth:sanctum like the other gateway return routes.
// Security comes from the signed val_id the gateway issues, not the session.
Route::match(['GET', 'POST'], '/payout/success', [\App\Http\Controllers\PayoutController::class, 'success'])->name('payout.success');
Route::match(['GET', 'POST'], '/payout/fail', [\App\Http\Controllers\PayoutController::class, 'fail'])->name('payout.fail');
Route::match(['GET', 'POST'], '/payout/cancel', [\App\Http\Controllers\PayoutController::class, 'cancel'])->name('payout.cancel');

Route::post('/chatbot/message', [\App\Http\Controllers\ChatbotController::class, 'message']);

Route::match(['GET', 'POST'], '/payment/success', [\App\Http\Controllers\PaymentController::class, 'success'])->name('payment.success');
Route::match(['GET', 'POST'], '/payment/fail', [\App\Http\Controllers\PaymentController::class, 'fail'])->name('payment.fail');
Route::match(['GET', 'POST'], '/payment/cancel', [\App\Http\Controllers\PaymentController::class, 'cancel'])->name('payment.cancel');

Route::match(['GET', 'POST'], '/entrepreneur-payment/success', [\App\Http\Controllers\EntrepreneurTransactionController::class, 'success'])->name('entrepreneur-payment.success');
Route::match(['GET', 'POST'], '/entrepreneur-payment/fail', [\App\Http\Controllers\EntrepreneurTransactionController::class, 'fail'])->name('entrepreneur-payment.fail');
Route::match(['GET', 'POST'], '/entrepreneur-payment/cancel', [\App\Http\Controllers\EntrepreneurTransactionController::class, 'cancel'])->name('entrepreneur-payment.cancel');
