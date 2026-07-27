<?php

namespace App\Enums;

enum BivasStatus: string
{
    case ACTIVE      = 'active';
    case INACTIVE    = 'inactive';
    case FAULTY      = 'faulty';
    case MAINTENANCE = 'maintenance';
}