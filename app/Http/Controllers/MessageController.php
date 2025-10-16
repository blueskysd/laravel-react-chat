<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display a list of users to chat with
     */
    public function index()
    {
        $currentUser = auth()->user();

        // Get all users except current user with their last message
        $users = User::where('id', '!=', $currentUser->id)
            ->get()
            ->map(function ($user) use ($currentUser) {
                $lastMessage = Message::where(function ($query) use ($currentUser, $user) {
                    $query->where('sender_id', $currentUser->id)
                        ->where('receiver_id', $user->id);
                })
                ->orWhere(function ($query) use ($currentUser, $user) {
                    $query->where('sender_id', $user->id)
                        ->where('receiver_id', $currentUser->id);
                })
                ->latest()
                ->first();

                $unreadCount = Message::where('sender_id', $user->id)
                    ->where('receiver_id', $currentUser->id)
                    ->whereNull('read_at')
                    ->count();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'last_message' => $lastMessage ? [
                        'content' => $lastMessage->content,
                        'created_at' => $lastMessage->created_at,
                        'is_sender' => $lastMessage->sender_id === $currentUser->id,
                    ] : null,
                    'unread_count' => $unreadCount,
                ];
            });

        return Inertia::render('Chat/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Display chat with a specific user
     */
    public function show(User $user)
    {
        $currentUser = auth()->user();

        // Mark all messages from this user as read
        Message::where('sender_id', $user->id)
            ->where('receiver_id', $currentUser->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        // Get all messages between current user and selected user
        $messages = Message::where(function ($query) use ($currentUser, $user) {
            $query->where('sender_id', $currentUser->id)
                ->where('receiver_id', $user->id);
        })
        ->orWhere(function ($query) use ($currentUser, $user) {
            $query->where('sender_id', $user->id)
                ->where('receiver_id', $currentUser->id);
        })
        ->with(['sender', 'receiver'])
        ->orderBy('created_at', 'asc')
        ->get()
        ->map(function ($message) use ($currentUser) {
            return [
                'id' => $message->id,
                'content' => $message->content,
                'created_at' => $message->created_at,
                'is_sender' => $message->sender_id === $currentUser->id,
                'read_at' => $message->read_at,
            ];
        });

        // Get all users for the sidebar
        $users = User::where('id', '!=', $currentUser->id)->get();

        return Inertia::render('Chat/Show', [
            'selectedUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'messages' => $messages,
            'users' => $users,
        ]);
    }

    /**
     * Send a message to a user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string|max:5000',
        ]);

        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $validated['receiver_id'],
            'content' => $validated['content'],
        ]);

        return back();
    }

    /**
     * Get messages with a specific user (for AJAX requests)
     */
    public function getMessages(User $user)
    {
        $currentUser = auth()->user();

        $messages = Message::where(function ($query) use ($currentUser, $user) {
            $query->where('sender_id', $currentUser->id)
                ->where('receiver_id', $user->id);
        })
        ->orWhere(function ($query) use ($currentUser, $user) {
            $query->where('sender_id', $user->id)
                ->where('receiver_id', $currentUser->id);
        })
        ->orderBy('created_at', 'asc')
        ->get()
        ->map(function ($message) use ($currentUser) {
            return [
                'id' => $message->id,
                'content' => $message->content,
                'created_at' => $message->created_at,
                'is_sender' => $message->sender_id === $currentUser->id,
                'read_at' => $message->read_at,
            ];
        });

        return response()->json($messages);
    }
}
