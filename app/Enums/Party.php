<?php

namespace App\Enums;

enum Party: string
{
    case APC   = 'APC';
    case PDP   = 'PDP';
    case LP    = 'LP';
    case NNPP  = 'NNPP';
    case APGA  = 'APGA';
    case SDP   = 'SDP';
    case ADC   = 'ADC';
    case YPP   = 'YPP';
    case ZLP   = 'ZLP';
    case OTHER = 'OTHER';

    public function label(): string
    {
        return match ($this) {
            self::APC   => 'All Progressives Congress (APC)',
            self::PDP   => 'Peoples Democratic Party (PDP)',
            self::LP    => 'Labour Party (LP)',
            self::NNPP  => 'New Nigeria Peoples Party (NNPP)',
            self::APGA  => 'All Progressives Grand Alliance (APGA)',
            self::SDP   => 'Social Democratic Party (SDP)',
            self::ADC   => 'African Democratic Congress (ADC)',
            self::YPP   => 'Young Progressives Party (YPP)',
            self::ZLP   => 'Zenith Labour Party (ZLP)',
            self::OTHER => 'Other',
        };
    }
}