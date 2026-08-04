<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class ChatbotController extends Controller
{
    public function message(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'reply' => 'Please send a valid message.',
            ], 422);
        }

        $apiKey = config('services.gemini.api_key') ?? env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json([
                'reply' => null,
            ], 503);
        }

        try {
            $response = Http::timeout(30)
                ->asJson()
                ->withOptions([
                    'verify' => false,
                ])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $request->message]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'maxOutputTokens' => 200,
                        'temperature' => 0.7,
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                return response()->json(['reply' => $reply ? trim($reply) : null]);
            }

            return response()->json([
                'reply' => null,
            ], 503);
        } catch (\Exception $e) {
            return response()->json([
                'reply' => null,
            ], 503);
        }
    }
}
