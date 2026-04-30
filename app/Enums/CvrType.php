<?php

namespace App\Enums;

enum CvrType: string
{
    case REGISTRATION = 'registration';
    case UPDATE       = 'update';
    case TRANSFER     = 'transfer';

    public function label(): string
    {
        return match ($this) {
            self::REGISTRATION => 'Registration',
            self::UPDATE       => 'Update',
            self::TRANSFER     => 'Transfer',
        };
    }
}
