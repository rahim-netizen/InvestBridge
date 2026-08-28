<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class ChatbotController extends Controller
{
    /**
     * Grounding context so the bot only answers questions about InvestBridge.
     */
    private const SYSTEM_PROMPT = <<<'PROMPT'
You are InvestBridge AI, the official virtual assistant for InvestBridge — a platform that connects startup founders with investors.

About InvestBridge:
- It lets founders publish "opportunities" (startup fundraising deals) and lets investors discover, save, and connect with those opportunities.
- Accounts are created with a @gmail.com email (the admin account is admin@gmail.com). After signup, a verification email with a link valid for 5 minutes is sent; the email must be verified before the account can sign in.
- Founders post opportunities from the "Opportunities you posted" page with a title, company, sector (HealthTech, CleanEnergy, E-commerce, AgriTech, FinTech, EdTech, or Others), location, funding goal, description, timeline, and an optional cover image. They can create, edit, and remove their own posts.
- Any user can connect with / save an opportunity they are interested in (they cannot save their own post). Founders can see the investors interested in their posts and accept a connection.
- Users complete a profile with company details, industry, position, website, mission, and photos. The site also has a dashboard, deals, connect, payment, and support sections. Admin users get a separate admin panel.

How to respond:
- Answer questions about InvestBridge: what it is, creating an account, email verification, posting and managing opportunities, connecting with investors, profiles, the dashboard, deals, support, and navigating the site.
- Be friendly, concise, and helpful. Use the details above. If asked something about InvestBridge that is not covered, give a sensible general answer and suggest contacting Support.
- If a question is unrelated to InvestBridge (e.g., general trivia, other products, coding help, or personal matters), politely explain you focus on helping with InvestBridge and steer the conversation back to the platform.
- Do not invent specific fees, policies, or exact URLs that were not described above. Do not give financial, legal, or investment advice; instead suggest consulting a qualified professional.
PROMPT;

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
            // Build the conversation. Support an optional `history` array
            // (each item: { role: 'user'|'model', text: '...' }) for context,
            // then append the latest user message.
            $contents = [];

            $history = $request->input('history');
            if (is_array($history)) {
                foreach ($history as $entry) {
                    $text = is_array($entry) ? ($entry['text'] ?? null) : null;
                    $role = is_array($entry) ? ($entry['role'] ?? null) : null;
                    if (is_string($text) && $text !== '' && in_array($role, ['user', 'model'], true)) {
                        $contents[] = [
                            'role' => $role,
                            'parts' => [['text' => $text]],
                        ];
                    }
                }
            }

            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $request->message]],
            ];

            $response = Http::timeout(30)
                ->asJson()
                ->withOptions([
                    'verify' => false,
                ])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    'systemInstruction' => [
                        'parts' => [['text' => self::SYSTEM_PROMPT]]
                    ],
                    'contents' => $contents,
                    'generationConfig' => [
                        'maxOutputTokens' => 400,
                        'temperature' => 0.5,
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
