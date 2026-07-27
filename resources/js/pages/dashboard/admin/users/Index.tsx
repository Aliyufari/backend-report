import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { UserPlus, Pencil, Trash2, CircleUser } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import UserModal from "./UserModal";
import DeleteUserModal from "./DeleteUserModal";
import DataTable from "@/components/ui/DataTable";
import users from "@/routes/admin/users";
import { Role, User, Paginated } from "@/types";

interface PuOption { id: string; name: string; number?: string; }

interface LocationNode {
    id: string;
    name: string;
    zones?: LocationNode[];
    lgas?: LocationNode[];
    wards?: LocationNode[];
    pus?: PuOption[];
    [key: string]: unknown;
}

type LocationScope = "state" | "zone" | "lga" | "ward";

interface PageProps {
    users: Paginated<User>;
    roles: Role[];
    filters: { search?: string; role?: string };
    locations: LocationNode[];
    locationScope: LocationScope;
    flash?: { status?: boolean; message?: string };
    [key: string]: unknown;
}

export default function UsersIndex() {
    const { props } = usePage<PageProps>();
    const { users: usersData, roles, locations, locationScope, filters, flash } = props;

    const [showModal,  setShowModal]  = useState(false);
    const [editUser,   setEditUser]   = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    useEffect(() => {
        if (flash?.message) {
            flash.status ? toast.success(flash.message) : toast.error(flash.message);
        }
    }, [flash]);

    const openCreate = () => { setEditUser(null); setShowModal(true); };
    const openEdit   = (user: User) => { setEditUser(user); setShowModal(true); };
    const openDelete = (user: User) => setDeleteUser(user);

    const activeRole = roles.find((r) => r.name === filters.role);

    // ── Column definitions ────────────────────────────────────────────────────

    const columns: Column<User>[] = [
        {
            key: "name",
            label: "User",
            type: "slot",
        },
        {
            key: "email",
            label: "Email",
            accessor: (row) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-foreground">
                    {row.email}
                </span>
            ),
        },
        {
            key: "role",
            label: "Role",
            accessor: (row) => (
                <span className="inline-flex items-center px-2.5 py-[3px] rounded-full
                    font-['DM_Mono',monospace] text-[11px] font-medium capitalize whitespace-nowrap
                    text-primary
                    bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]
                    border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                    {row.role?.name ?? "—"}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Created",
            accessor: (row) => (
                <span className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                    })}
                </span>
            ),
        },
        { key: "actions", label: "Actions", type: "actions", align: "right" },
    ];

    return (
        <>
            <Head title="Manage Users" />
            <AppLayout
                SideNavigation={AdminSidebar}
                title="Manage Users"
                sub="Create and manage system user accounts"
                live={false}
                actions={
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                            font-['Syne',sans-serif] bg-primary text-primary-foreground
                            transition-all hover:opacity-90"
                    >
                        <UserPlus size={15} />
                        Add User
                    </button>
                }
            >
                <DataTable
                    data={usersData}
                    columns={columns}
                    indexUrl={users.index().url}
                    filters={filters as Record<string, string>}
                    filterConfigs={[
                        {
                            key: "role",
                            label: "Role",
                            value: filters.role ?? "",
                            options: roles.map((r) => ({ value: r.name, label: r.name })),
                        },
                    ]}
                    searchPlaceholder="Search users..."
                    noun="users"
                    countSuffix={
                        activeRole && (
                            <>filtered by <strong className="text-foreground">{activeRole.name}</strong></>
                        )
                    }
                    reloadOnly={["users"]}
                    emptyIcon={<CircleUser size={32} />}
                    emptyMessage="No users found"
                    renderSlot={(key, row) =>
                        key === "name" ? (
                            <div className="flex items-center gap-3">
                                <div className="w-[34px] h-[34px] rounded-full overflow-hidden flex-shrink-0
                                    flex items-center justify-center
                                    bg-[color-mix(in_oklch,var(--primary)_12%,var(--muted))]
                                    border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                                    {row.avatar
                                        ? <img src={`/storage/${row.avatar}`} alt={row.name} className="w-full h-full object-cover" />
                                        : <span className="font-['Syne',sans-serif] text-[13px] font-bold text-primary uppercase">
                                            {row.name.charAt(0)}
                                          </span>
                                    }
                                </div>
                                <span className="font-['Syne',sans-serif] font-semibold text-[13px]">
                                    {row.name}
                                </span>
                            </div>
                        ) : null
                    }
                    renderActions={(row) => (
                        <div className="flex items-center justify-end gap-1.5">
                            <button
                                title="Edit"
                                onClick={() => openEdit(row)}
                                className="w-[30px] h-[30px] rounded-[7px] inline-flex items-center justify-center
                                    border border-border bg-transparent cursor-pointer transition-all duration-150
                                    text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <Pencil size={13} />
                            </button>
                            <button
                                title="Delete"
                                onClick={() => openDelete(row)}
                                className="w-[30px] h-[30px] rounded-[7px] inline-flex items-center justify-center
                                    border border-border bg-transparent cursor-pointer transition-all duration-150
                                    text-muted-foreground
                                    hover:bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)]
                                    hover:text-destructive
                                    hover:border-[color-mix(in_oklch,var(--destructive)_30%,transparent)]"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    )}
                />

                <UserModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    roles={roles}
                    locations={locations}
                    locationScope={locationScope}
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