import { useState, useEffect } from "react";
import { usePage, Head } from "@inertiajs/react";
import { Users, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import GovernorSidebar from "@/components/sidebar/GovernorSidebar";
import StaffModal from "./StaffModal";
import DeleteStaffModal from "./DeleteStaffModal";
import DataTable from "@/components/ui/DataTable";
import staffRoutes from "@/routes/governor/staff";

interface Option { value: string; label: string; }
interface StateOption { id: string; name: string; }

interface StaffMember {
    id: string;
    staff_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    department: string;
    position: string | null;
    status: string;
    state?: StateOption | null;
    date_joined: string | null;
    created_at: string;
    [key: string]: unknown;
}

interface Paginated<T> {
    data: T[]; links: any[]; current_page: number; last_page: number; total: number; from: number; to: number;
}

interface PageProps {
    staff: Paginated<StaffMember>;
    departments: Option[];
    statuses: Option[];
    filters: any;
    flash?: any;
    statistics: { total: number; active: number; on_leave: number };
    permissions: { can_create: boolean };
    [key: string]: unknown;
}

const STATUS_COLORS: Record<string, string> = {
    active: "text-emerald-600",
    on_leave: "text-amber-600",
    suspended: "text-red-600",
    terminated: "text-zinc-500",
};

export default function StaffIndex() {
    const { props } = usePage<PageProps>();
    const { staff: staffData, departments, statuses, filters, flash, statistics, permissions } = props;

    const [showModal, setShowModal] = useState(false);
    const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
    const [deleteStaff, setDeleteStaff] = useState<StaffMember | null>(null);

    useEffect(() => {
        if (flash?.message) flash.status ? toast.success(flash.message) : toast.error(flash.message);
    }, [flash]);

    const departmentLabel = (value: string) => departments.find(d => d.value === value)?.label ?? value;

    return (
        <>
            <Head title="Staffing" />
            <AppLayout
                SideNavigation={GovernorSidebar}
                title="Staffing"
                sub="Manage INEC department staff in your state"
                live
                actions={
                    permissions?.can_create && (
                        <button
                            onClick={() => { setEditStaff(null); setShowModal(true); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                            font-['Syne',sans-serif] bg-primary text-primary-foreground transition-all hover:opacity-90"
                        >
                            <Users size={15} /> Add Staff
                        </button>
                    )
                }
            >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    <div className="relative flex flex-col gap-3 p-4 rounded-xl border bg-blue-50 border-blue-200 overflow-hidden">
                        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Total Staff</span>
                        <span className="text-2xl font-bold tabular-nums text-blue-800">{statistics.total.toLocaleString()}</span>
                    </div>
                    <div className="relative flex flex-col gap-3 p-4 rounded-xl border bg-emerald-50 border-emerald-200 overflow-hidden">
                        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Active</span>
                        <span className="text-2xl font-bold tabular-nums text-emerald-600">{statistics.active.toLocaleString()}</span>
                    </div>
                    <div className="relative flex flex-col gap-3 p-4 rounded-xl border bg-amber-50 border-amber-200 overflow-hidden">
                        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">On Leave</span>
                        <span className="text-2xl font-bold tabular-nums text-amber-600">{statistics.on_leave.toLocaleString()}</span>
                    </div>
                </div>

                <DataTable
                    data={staffData}
                    columns={[
                        {
                            key: "full_name", label: "Staff",
                            accessor: (row: StaffMember) => (
                                <div>
                                    <p className="font-['Syne',sans-serif] font-semibold text-[13px]">{row.full_name}</p>
                                    <p className="text-[11px] font-['DM_Mono',monospace] text-muted-foreground">{row.staff_id}</p>
                                </div>
                            ),
                        },
                        {
                            key: "department", label: "Department",
                            accessor: (row: StaffMember) => (
                                <span className="text-xs text-muted-foreground">{departmentLabel(row.department)}</span>
                            ),
                        },
                        {
                            key: "position", label: "Position",
                            accessor: (row: StaffMember) => <span className="text-xs text-muted-foreground">{row.position ?? "—"}</span>,
                        },
                        {
                            key: "status", label: "Status",
                            accessor: (row: StaffMember) => (
                                <span className={`capitalize ${STATUS_COLORS[row.status] ?? ""}`}>{row.status.replace(/_/g, " ")}</span>
                            ),
                        },
                        { key: "actions", label: "Actions", type: "actions", align: "right" },
                    ]}
                    indexUrl={staffRoutes.index().url}
                    filters={filters}
                    filterConfigs={[
                        { key: "department", label: "Department", value: filters.department ?? "", options: departments },
                        { key: "status", label: "Status", value: filters.status ?? "", options: statuses },
                    ]}
                    searchPlaceholder="Search staff..."
                    noun="staff"
                    reloadOnly={["staff"]}
                    emptyIcon={<Users size={32} />}
                    renderActions={(row: StaffMember) => (
                        <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => { setEditStaff(row); setShowModal(true); }}><Pencil size={14} /></button>
                            <button onClick={() => setDeleteStaff(row)}><Trash2 size={14} /></button>
                        </div>
                    )}
                />

                <StaffModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    departments={departments}
                    statuses={statuses}
                    staff={editStaff}
                />
                <DeleteStaffModal open={!!deleteStaff} onClose={() => setDeleteStaff(null)} staff={deleteStaff} />
            </AppLayout>
        </>
    );
}