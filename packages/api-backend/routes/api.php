<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\VerifyEmailController;

Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/email/resend-verification', [EmailVerificationNotificationController::class, 'store']);
Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['signed', 'throttle:6,1'])
    ->name('api.verification.verify');

Route::get('/opportunities/all', [\App\Http\Controllers\OpportunityController::class, 'all']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        $user->setRelation('profile', $user->profile);
        return $user;
    });
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);
    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'show']);
    Route::put('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);

    Route::get('/opportunities', [\App\Http\Controllers\OpportunityController::class, 'index']);
    Route::post('/opportunities', [\App\Http\Controllers\OpportunityController::class, 'store']);
    Route::get('/opportunities/{id}', [\App\Http\Controllers\OpportunityController::class, 'show']);
    Route::delete('/opportunities/{id}', [\App\Http\Controllers\OpportunityController::class, 'destroy']);

    Route::get('/connected-opportunities', [\App\Http\Controllers\ConnectedOpportunityController::class, 'index']);
    Route::post('/connected-opportunities', [\App\Http\Controllers\ConnectedOpportunityController::class, 'store']);
    Route::delete('/connected-opportunities/{id}', [\App\Http\Controllers\ConnectedOpportunityController::class, 'destroy']);
});

Route::post('/chatbot/message', [\App\Http\Controllers\ChatbotController::class, 'message']);
