<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsNotAdmin
{
    /**
     * Block the admin account from investor/founder-only endpoints
     * (profile, opportunities, connections) — it is confined to /api/admin/*.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isAdmin()) {
            return response()->json(['message' => 'Admin accounts cannot use this feature.'], 403);
        }

        return $next($request);
    }
}
