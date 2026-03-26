import { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { Search, UserPlus, Pencil, Trash2, RefreshCw, CircleUser } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import UserModal from "./UserModal";
import DeleteUserModal from "./DeleteUserModal";
import users from "@/routes/users";

interface Role {
    id: string;
    name: string;
    value: string;
    label: string;
}

interface Pu    { id: string; name: string; number?: string; }
interface Ward  { id: string; name: string; pus:   Pu[];   }
interface Lga   { id: string; name: string; wards: Ward[]; }
interface Zone  { id: string; name: string; lgas:  Lga[];  }
interface State { id: string; name: string; zones: Zone[]; }

interface User {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role_id: string;
    role?: Role;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface PageProps {
    users: Paginated<User>;
    roles: Role[];
    filters: { search?: string; role?: string };
    state: State[];
    flash?: { status?: boolean; message?: string };
    [key: string]: unknown;
}

export default function UsersIndex() {
    const { props } = usePage<PageProps>();
    const { users: usersData, roles, state, filters, flash } = props;

    const [search, setSearch]     = useState(filters.search ?? "");
    const [roleFilter, setRoleFilter] = useState(filters.role ?? "");
    const [showModal, setShowModal]   = useState(false);
    const [editUser, setEditUser]     = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    useEffect(() => {
        if (flash?.message) {
            flash.status ? toast.success(flash.message) : toast.error(flash.message);
        }
    }, [flash]);

    const applyFilters = (overrides: Record<string, string> = {}) => {
        const params: Record<string, string> = {};
        const s = overrides.search    ?? search;
        const r = overrides.role      ?? roleFilter;
        if (s) params.search = s;
        if (r) params.role   = r;
        router.get(users.index().url, params, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const handleRoleChange = (value: string) => {
        setRoleFilter(value);
        applyFilters({ role: value });
    };

    const handleRefresh = () => router.reload({ only: ["users"] });

    const openCreate = () => { setEditUser(null); setShowModal(true); };
    const openEdit   = (user: User) => { setEditUser(user); setShowModal(true); };
    const openDelete = (user: User) => setDeleteUser(user);

    const activeRole = roles.find(r => r.value === roleFilter);

    return (
        <>
            <Head title="Manage Users" />
            <AppLayout
                SideNavigation={AdminSidebar}
                title="Manage Users"
                sub="Create and manage system user accounts"
                live={false}
                actions={
                    <button onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                        style={{ fontFamily: "'Syne', sans-serif", background: "var(--primary)", color: "var(--primary-foreground)" }}>
                        <UserPlus size={15} />
                        Add User
                    </button>
                }
            >
                <style>{`
                    @import url('https://fonts.bunny.net/css?family=dm-mono:400,500|syne:600,700');

                    .users-table { width: 100%; border-collapse: collapse; }
                    .users-table th {
                        font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
                        text-transform: uppercase; letter-spacing: 0.08em;
                        color: var(--muted-foreground); padding: 10px 14px; text-align: left;
                        border-bottom: 1px solid var(--border); white-space: nowrap;
                    }
                    .users-table td {
                        padding: 12px 14px; border-bottom: 1px solid var(--border);
                        font-size: 13px; color: var(--foreground); vertical-align: middle;
                    }
                    .users-table tr:last-child td { border-bottom: none; }
                    .users-table tbody tr { transition: background 0.12s ease; }
                    .users-table tbody tr:hover { background: color-mix(in oklch, var(--primary) 4%, transparent); }

                    .role-badge {
                        display: inline-flex; align-items: center;
                        padding: 3px 10px; border-radius: 20px;
                        font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
                        background: color-mix(in oklch, var(--primary) 10%, transparent);
                        color: var(--primary);
                        border: 1px solid color-mix(in oklch, var(--primary) 20%, transparent);
                        white-space: nowrap; text-transform: capitalize;
                    }

                    .action-btn {
                        width: 30px; height: 30px; border-radius: 7px;
                        display: inline-flex; align-items: center; justify-content: center;
                        border: 1px solid var(--border); background: transparent;
                        cursor: pointer; transition: all 0.15s ease; color: var(--muted-foreground);
                    }
                    .action-btn:hover { background: var(--muted); color: var(--foreground); }
                    .action-btn.danger:hover {
                        background: color-mix(in oklch, var(--destructive) 10%, transparent);
                        color: var(--destructive);
                        border-color: color-mix(in oklch, var(--destructive) 30%, transparent);
                    }

                    .search-input {
                        padding: 8px 12px 8px 36px; border: 1px solid var(--border); border-radius: 8px;
                        font-family: 'DM Mono', monospace; font-size: 12px;
                        color: var(--foreground); background: var(--background);
                        outline: none; width: 200px; transition: all 0.15s;
                    }
                    .search-input:focus { border-color: var(--primary); width: 240px; }
                    .search-input::placeholder { color: var(--muted-foreground); }

                    .role-filter-select {
                        padding: 8px 32px 8px 10px; border: 1px solid var(--border); border-radius: 8px;
                        font-family: 'DM Mono', monospace; font-size: 12px;
                        color: var(--foreground); background: var(--background);
                        outline: none; cursor: pointer; appearance: none;
                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                        background-repeat: no-repeat; background-position: right 10px center;
                        transition: border-color 0.15s; min-width: 130px;
                    }
                    .role-filter-select:focus { border-color: var(--primary); }
                    .role-filter-select.active { border-color: var(--primary); color: var(--primary); background-color: color-mix(in oklch, var(--primary) 6%, var(--background)); }

                    .page-btn {
                        min-width: 32px; height: 32px; border-radius: 7px;
                        display: inline-flex; align-items: center; justify-content: center;
                        font-family: 'DM Mono', monospace; font-size: 12px;
                        border: 1px solid var(--border); background: transparent;
                        color: var(--muted-foreground); cursor: pointer; transition: all 0.15s; padding: 0 6px;
                    }
                    .page-btn:hover:not(:disabled) { background: var(--muted); color: var(--foreground); }
                    .page-btn.active { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
                    .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

                    .avatar-circle {
                        width: 34px; height: 34px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
                        background: color-mix(in oklch, var(--primary) 12%, var(--muted));
                        display: flex; align-items: center; justify-content: center;
                        border: 1.5px solid color-mix(in oklch, var(--primary) 20%, transparent);
                    }
                    .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
                    .avatar-initials {
                        font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
                        color: var(--primary); text-transform: uppercase;
                    }

                    .filter-chip {
                        display: inline-flex; align-items: center; gap: 5px;
                        padding: 3px 10px; border-radius: 20px; font-size: 11px;
                        font-family: 'DM Mono', monospace;
                        background: color-mix(in oklch, var(--primary) 10%, transparent);
                        color: var(--primary);
                        border: 1px solid color-mix(in oklch, var(--primary) 25%, transparent);
                        cursor: pointer; transition: all 0.15s;
                    }
                    .filter-chip:hover { background: color-mix(in oklch, var(--primary) 18%, transparent); }
                `}</style>

                <div className="bg-card rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "var(--border)" }}>
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--muted-foreground)" }}>
                                Showing {usersData.from ?? 0}–{usersData.to ?? 0} of {usersData.total} users
                                {activeRole && (
                                    <span style={{ marginLeft: 8 }}>
                                        filtered by <strong style={{ color: "var(--foreground)" }}>{activeRole.label}</strong>
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Role filter */}
                                <select
                                    className={`role-filter-select ${roleFilter ? "active" : ""}`}
                                    value={roleFilter}
                                    onChange={e => handleRoleChange(e.target.value)}
                                >
                                    <option value="">All Roles</option>
                                    {roles.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>

                                {/* Search */}
                                <form onSubmit={handleSearch} className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                                    <input
                                        type="text" className="search-input"
                                        placeholder="Search users..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </form>

                                <button onClick={handleRefresh}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-all hover:bg-muted"
                                    style={{ fontFamily: "'DM Mono', monospace", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                                    <RefreshCw size={13} />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Active filter chips */}
                        {(search || roleFilter) && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)" }}>Active filters:</span>
                                {search && (
                                    <span className="filter-chip" onClick={() => { setSearch(""); applyFilters({ search: "" }); }}>
                                        "{search}" ×
                                    </span>
                                )}
                                {roleFilter && activeRole && (
                                    <span className="filter-chip" onClick={() => { setRoleFilter(""); applyFilters({ role: "" }); }}>
                                        {activeRole.label} ×
                                    </span>
                                )}
                                <button
                                    onClick={() => { setSearch(""); setRoleFilter(""); router.get(users.index().url, {}, { replace: true }); }}
                                    style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--destructive)", background: "none", border: "none", cursor: "pointer" }}>
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Created</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersData.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: "center", padding: "48px 0", color: "var(--muted-foreground)" }}>
                                            <CircleUser size={32} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
                                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                                                {search || roleFilter ? "No users match your filters" : "No users found"}
                                            </p>
                                        </td>
                                    </tr>
                                ) : usersData.data.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar-circle">
                                                    {user.avatar
                                                        ? <img src={`/storage/${user.avatar}`} alt={user.name} />
                                                        : <span className="avatar-initials">{user.name.charAt(0)}</span>
                                                    }
                                                </div>
                                                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13 }}>
                                                    {user.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{user.email}</td>
                                        <td><span className="role-badge">{user.role?.name ?? "—"}</span></td>
                                        <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)" }}>
                                            {new Date(user.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button className="action-btn" title="Edit" onClick={() => openEdit(user)}>
                                                    <Pencil size={13} />
                                                </button>
                                                <button className="action-btn danger" title="Delete" onClick={() => openDelete(user)}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {usersData.last_page > 1 && (
                        <div className="flex items-center justify-center gap-1.5 px-5 py-4 border-t" style={{ borderColor: "var(--border)" }}>
                            {usersData.links.map((link, i) => (
                                <button
                                    key={i}
                                    className={`page-btn ${link.active ? "active" : ""}`}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <UserModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    roles={roles}
                    state={state}
                    user={editUser}
                />
                <DeleteUserModal
                    open={!!deleteUser}
                    onClose={() => setDeleteUser(null)}
                    user={deleteUser}
                />
            </AppLayout>
        </>
    );
}