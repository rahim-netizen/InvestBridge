<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\Complaint;
use App\Models\User;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function searchUsers(Request $request)
    {
        $query = trim((string) $request->query('q', ''));

        $users = User::where(function ($users) {
                $users->whereNull('role')->orWhere('role', '!=', 'admin');
            })
            ->where('id', '!=', $request->user()->id)
            ->where(function ($users) use ($query) {
                $users->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->orderBy('name')
            ->limit(30)
            ->get(['id', 'name', 'email', 'role']);

        return response()->json(['users' => $users]);
    }

    public function complaints(Request $request)
    {
        $complaints = Complaint::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['complaints' => $complaints]);
    }

    public function createComplaint(Request $request)
    {
        $data = $request->validate([
            'subject' => ['required', 'string', 'max:150'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $complaint = Complaint::create([
            ...$data,
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['complaint' => $complaint], 201);
    }

    public function messages(Request $request, string $chatHash)
    {
        $messages = ChatMessage::with('user:id,name,email')
            ->where('chat_hash', $chatHash)
            ->oldest()
            ->get()
            ->map(fn (ChatMessage $message) => [
                'id' => $message->id,
                'sender' => $message->user->name ?? $message->user->email,
                'text' => $message->message,
                'time' => $message->created_at->format('g:i A'),
                'self' => $message->user_id === $request->user()->id,
            ]);

        return response()->json(['messages' => $messages]);
    }

    public function sendMessage(Request $request, string $chatHash)
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $message = ChatMessage::create([
            'chat_hash' => $chatHash,
            'user_id' => $request->user()->id,
            'message' => $data['message'],
        ]);

        return response()->json(['message' => $message], 201);
    }
}
