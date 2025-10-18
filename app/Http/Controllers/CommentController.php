<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Decision;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{
    public function index($id)
    {
        $decision = Decision::findOrFail($id);
        $comments = $decision->comments()
            ->with('decision', 'user')
            ->paginate(20);

        return response()->json($comments);
    }

    public function store(Request $request, $id)
    {
        $decision = Decision::findOrFail($id);

        $validated = $request->validate([
            'content' => 'required|string|min:10|max:1000',
        ]);

        $comment = DB::transaction(function () use ($validated, $decision) {
            return Comment::create([
                'user_id' => Auth::id(),
                'decision_id' => $decision->id,
                'content' => $validated['content'],
            ]);
        });

        Auth::user()->increment('karma', 5);
        $comment->load('user');

        return response()->json($comment, 201);
    }
}
