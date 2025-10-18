<?php

namespace App\Http\Controllers;

use App\Models\Decision;
use Illuminate\Http\Request;

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
}
