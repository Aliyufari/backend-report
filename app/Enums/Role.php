<?php

namespace App\Enums;

enum Role: string
{
    case SUPER_ADMIN = 'super_admin';
    case ADMIN = 'admin';
    case GOVERNOR = 'governor';
    case STATE_COORDINATOR = 'state_coordinator';
    case ZONAL_COORDINATOR = 'zonal_coordinator';
    case LGA_COORDINATOR = 'lga_coordinator';
    case WARD_COORDINATOR = 'ward_coordinator';
    case USER = 'user';
}
