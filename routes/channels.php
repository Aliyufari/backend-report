<?php

use Illuminate\Support\Facades\Broadcast;

// Broadcast::routes(['middleware' => ['auth']]);

// Authorize the private channel — only the owning user can listen
Broadcast::channel('upload.{userId}', function ($user, $userId) {
    return $user->id === $userId;
});
