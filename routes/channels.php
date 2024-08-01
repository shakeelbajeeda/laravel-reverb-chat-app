<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('laravel-reverb.{user}', function (\App\Models\User $user) {
    return auth()->check();
});
