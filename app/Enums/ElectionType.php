<?php

namespace App\Enums;

enum ElectionType: string
{
    case GENERAL          = 'general';
    case PRESIDENTIAL     = 'presidential';
    case GUBERNATORIAL    = 'gubernatorial';
    case NATIONAL_ASSEMBLY = 'national_assembly';
    case STATE_ASSEMBLY   = 'state_assembly';
    case LOCAL_GOVERNMENT = 'local_government';
    case BYE_ELECTION     = 'bye_election';
    case REFERENDUM       = 'referendum';

    public function label(): string
    {
        return match ($this) {
            self::GENERAL           => 'General Election',
            self::PRESIDENTIAL      => 'Presidential',
            self::GUBERNATORIAL     => 'Gubernatorial',
            self::NATIONAL_ASSEMBLY => 'National Assembly',
            self::STATE_ASSEMBLY    => 'State Assembly',
            self::LOCAL_GOVERNMENT  => 'Local Government',
            self::BYE_ELECTION      => 'Bye-Election',
            self::REFERENDUM        => 'Referendum',
        };
    }
}