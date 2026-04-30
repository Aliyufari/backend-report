import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

// export interface Role {
//     id: string;
//     name: string;
//     value: string;
//     label: string;
// }

export interface Role {
    id: string;
    name: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string | null;

    role: Role | null;

    location_type: string | null;
    location_id: string | null;

    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    created_by?: string;
    updated_by: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Pu    { id: string; name: string; code?: string; }
export interface Ward  { id: string; name: string; pus:   Pu[];   }
export interface Lga   { id: string; name: string; wards: Ward[]; }
export interface Zone  { id: string; name: string; lgas:  Lga[];  }
export interface State { id: string; name: string; zones: Zone[]; }

export interface Cvr {
    id: number | string;
    unique_id: string;
    type: string;
    status: string;
    pu_id: number | string;
    pu?: Pu | null;
    created_by?: User | null;
    updated_by?: User | null;
    created_at: string;
    updated_at: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

export interface PageProps {
    users: Paginated<User>;
    roles: Role[];
    filters: { search?: string; role?: string };
    state: State[];
    flash?: { status?: boolean; message?: string };
    [key: string]: unknown;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: { id: string; name: string } | null;
}

export type Roles = "super_admin" | "admin" | "governor" | "state_coordinator" | "zonal_coordinator" | "lga_coordinator"  | "ward_coordinator";

export type NameID = {
    "id": string;
    "name": string;
    "created_at"?: string;
    "updated_at"?: string;
}