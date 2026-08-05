<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = Auth::user();

        $profile = Profile::where('user_id', $user->id)->first();

        if (!$profile) {
            return response()->json([
                'profile' => null,
                'user' => $user,
            ]);
        }

        return response()->json([
            'profile' => $profile,
            'user' => $user,
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'full_name' => ['nullable', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'industry' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'mission' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'profile_complete' => ['nullable', 'boolean'],
        ]);

        if (!empty($validated['website']) && !preg_match('#^https?://#i', $validated['website'])) {
            $validated['website'] = 'https://' . $validated['website'];
        }

        if (!empty($validated['full_name'])) {
            $user->update(['name' => $validated['full_name']]);
            $user->refresh();
        }

        $profile = Profile::where('user_id', $user->id)->first();

        if (!$profile) {
            $profile = Profile::create([
                'user_id' => $user->id,
                ...$validated,
                'profile_complete' => $validated['profile_complete'] ?? true,
            ]);
        } else {
            $profile->update($validated);
        }

        return response()->json([
            'profile' => $profile,
            'user' => $user,
        ]);
    }
}
