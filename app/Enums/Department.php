<?php

namespace App\Enums;

enum Department: string
{
    case ADMINISTRATION            = 'administration';
    case ELECTION_PARTY_MONITORING = 'election_and_party_monitoring';
    case FINANCE_ACCOUNTS          = 'finance_and_accounts';
    case HUMAN_RESOURCES           = 'human_resources_management';
    case ICT                       = 'ict';
    case LEGAL_SERVICES            = 'legal_services';
    case PLANNING_MONITORING       = 'planning_monitoring_and_strategy';
    case PROCUREMENT               = 'procurement';
    case VOTER_EDUCATION           = 'voter_education_and_publicity';

    public function label(): string
    {
        return match ($this) {
            self::ADMINISTRATION            => 'Administration',
            self::ELECTION_PARTY_MONITORING => 'Election and Party Monitoring',
            self::FINANCE_ACCOUNTS          => 'Finance and Accounts',
            self::HUMAN_RESOURCES           => 'Human Resources Management',
            self::ICT                       => 'Information and Communication Technology (ICT)',
            self::LEGAL_SERVICES            => 'Legal Services',
            self::PLANNING_MONITORING       => 'Planning, Monitoring and Strategy',
            self::PROCUREMENT               => 'Procurement',
            self::VOTER_EDUCATION           => 'Voter Education and Publicity',
        };
    }
}