<?php

namespace App\Http\Controllers;

use App\Events\SendMessage;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function dashboard(Request $request)
    {
        $messages = [];
        $userId = (int)$request->userId;

        if ($userId) {
            $messages = Message::with(['sender:id,name', 'receiver:id,name'])
                ->where(function ($query) use ($userId) {
                    $query->where(function ($query) use ($userId) {
                        $query->where('sender_id', $userId)
                            ->where('receiver_id', \auth()->id());
                    })->orWhere(function ($query) use ($userId) {
                        $query->where('receiver_id', $userId)
                            ->where('sender_id', \auth()->id());
                    });
                })
                ->get();
        }

        $users = User::whereNot('id', auth()->id())->get();
        return Inertia::render('Dashboard', [
            'users' => $users,
            'messages' => $messages
        ]);
    }

    /**
     * Store message and broadcast to others
     * @param Request $request
     * @return void
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required',
            'receiver_id' => 'required',
        ]);
        $validated['sender_id'] = auth()->id();

        $message = Message::create($validated);
        $message = $message->load('sender:id,name', 'receiver:id,name');

        broadcast(new SendMessage($message))->toOthers();
    }
}
