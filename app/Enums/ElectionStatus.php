<?php

namespace App\Enums;

enum ElectionStatus: string
{
    case UPCOMING  = 'upcoming';
    case ONGOING   = 'ongoing';
    case COMPLETED = 'completed';
}