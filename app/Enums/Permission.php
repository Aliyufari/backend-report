<?php

namespace App\Enums;

enum Permission: string
{
    // USER
    case USER_VIEW = 'user:view';
    case USER_CREATE = 'user:create';
    case USER_EDIT = 'user:edit';
    case USER_DELETE = 'user:delete';

        // CVR
    case CVR_VIEW = 'cvr:view';
    case CVR_CREATE = 'cvr:create';
    case CVR_EDIT = 'cvr:edit';
    case CVR_DELETE = 'cvr:delete';

        // STATE
    case STATE_VIEW = 'state:view';
    case STATE_CREATE = 'state:create';
    case STATE_EDIT = 'state:edit';
    case STATE_DELETE = 'state:delete';

        // ZONE
    case ZONE_VIEW = 'zone:view';
    case ZONE_CREATE = 'zone:create';
    case ZONE_EDIT = 'zone:edit';
    case ZONE_DELETE = 'zone:delete';

        // LGA
    case LGA_VIEW = 'lga:view';
    case LGA_CREATE = 'lga:create';
    case LGA_EDIT = 'lga:edit';
    case LGA_DELETE = 'lga:delete';

        // WARD
    case WARD_VIEW = 'ward:view';
    case WARD_CREATE = 'ward:create';
    case WARD_EDIT = 'ward:edit';
    case WARD_DELETE = 'ward:delete';
}
