<?php

namespace App\Http\Controllers;

use App\Models\Checkpoint;
use App\Models\Opportunity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CheckpointController extends Controller
{
    public function index(Request $request, $opportunityId)
    {
        $user = Auth::user();

        $opportunity = Opportunity::where('id', $opportunityId)->firstOrFail();

        $checkpoints = Checkpoint::where('opportunity_id', $opportunity->id)
            ->where(function ($query) use ($user) {
                $query->where('investor_id', $user->id)
                    ->orWhere('entrepreneur_id', $user->id);
            })
            ->orderBy('id')
            ->get();

        return response()->json([
            'checkpoints' => $checkpoints,
        ]);
    }

    public function store(Request $request, $opportunityId)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'checkpoints' => ['required', 'array', 'min:1', 'max:5'],
            'checkpoints.*.title' => ['required', 'string', 'max:255'],
            'checkpoints.*.description' => ['nullable', 'string', 'max:2000'],
            'checkpoints.*.amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $opportunity = Opportunity::where('id', $opportunityId)->firstOrFail();

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

        $checkpoints = DB::transaction(function () use ($validated, $opportunity, $user) {
            $created = [];
            foreach ($validated['checkpoints'] as $cp) {
                $created[] = Checkpoint::create([
                    'opportunity_id' => $opportunity->id,
                    'investor_id' => $user->id,
                    'entrepreneur_id' => $opportunity->user_id,
                    'title' => $cp['title'],
                    'description' => $cp['description'] ?? null,
                    'amount' => $cp['amount'],
                ]);
            }

            $opportunity->investor_id = $user->id;
            $opportunity->save();

            return $created;
        });

        return response()->json([
            'checkpoints' => $checkpoints,
            'message' => 'Checkpoints saved successfully.',
        ], 201);
    }
}
