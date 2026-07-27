<?php

namespace App\Enums;

enum RecordStatus: string
{
    case PENDING  = 'pending';
    case VERIFIED = 'verified';
    case FLAGGED  = 'flagged';
}
