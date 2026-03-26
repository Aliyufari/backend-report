<?php

namespace App\Enums;

enum Location: string
{
    case STATE = 'state';
    case ZONE = 'zone';
    case LGA = 'lga';
    case WARD = 'ward';
    case PU = 'pu';
}
