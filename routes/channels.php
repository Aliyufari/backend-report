<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['web', 'auth']]);

Broadcast::channel('upload.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});