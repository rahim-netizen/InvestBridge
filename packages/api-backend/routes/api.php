<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\SupportController;

Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/email/resend-verification', [EmailVerificationNotificationController::class, 'store']);
Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['signed:relative', 'throttle:6,1'])
    ->name('api.verification.verify');

Route::get('/opportunities/all', [\App\Http\Controllers\OpportunityController::class, 'all']);
Route::get('/stats', [\App\Http\Controllers\StatsController::class, 'index']);

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
        Route::post('/opportunities/{id}/accept', [\App\Http\Controllers\ConnectedOpportunityController::class, 'acceptConnection']);

        Route::get('/opportunities/{id}/checkpoints', [\App\Http\Controllers\CheckpointController::class, 'index']);
        Route::post('/opportunities/{id}/checkpoints', [\App\Http\Controllers\CheckpointController::class, 'store']);
        Route::post('/opportunities/{id}/pay', [\App\Http\Controllers\PaymentController::class, 'initiate']);
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
    });
});

Route::post('/chatbot/message', [\App\Http\Controllers\ChatbotController::class, 'message']);

Route::match(['GET', 'POST'], '/payment/success', [\App\Http\Controllers\PaymentController::class, 'success'])->name('payment.success');
Route::match(['GET', 'POST'], '/payment/fail', [\App\Http\Controllers\PaymentController::class, 'fail'])->name('payment.fail');
Route::match(['GET', 'POST'], '/payment/cancel', [\App\Http\Controllers\PaymentController::class, 'cancel'])->name('payment.cancel');
