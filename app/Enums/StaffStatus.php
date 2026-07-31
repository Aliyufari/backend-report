<?php

namespace App\Enums;

enum StaffStatus: string
{
    case ACTIVE     = 'active';
    case ON_LEAVE   = 'on_leave';
    case SUSPENDED  = 'suspended';
    case TERMINATED = 'terminated';
}