<?php

use Illuminate\Support\Facades\Route;

// Must stay above the catch-all: e-mail verification links point at
// /verify-email/{id}/{hash} from this file.
require __DIR__.'/auth.php';

// Serve the built React app (packages/ui -> public/app) for every non-API path.
Route::get('/{any?}', fn () => response()->file(public_path('app/index.html')))
    ->where('any', '(?!api/|up$).*');
