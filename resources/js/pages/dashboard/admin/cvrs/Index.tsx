import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { IdCard, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import CvrModal from "./CvrModal";
import DeleteCvrModal from "./DeleteCvrModal";
import DataTable from "@/components/ui/DataTable";
import cvrs from "@/routes/cvrs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pu { id: string; name: string; number?: string; ward?: any; }
interface State { id: string; name: string; zones: any[]; }

interface Option { value: string; label: string; }

interface Cvr {
    id: string;
    unique_id: string;
    type: string;
    status: string;
    pu_id: string;
    pu?: any;
    created_at: string;
    [key: string]: unknown;
}

interface Paginated<T> {
    data: T[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface PageProps {
    cvrs: Paginated<Cvr>;
    state: State[];
    types: Option[];
    statuses: Option[];
    filters: any;
    flash?: any;

    statistics: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };

    permissions: {
        can_create: boolean;
    };

    [key: string]: unknown;
}

// ─── Badge config ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    pending: "text-amber-600",
    approved: "text-emerald-600",
    rejected: "text-red-600",
};

// ─── Stat card config ─────────────────────────────────────────────────────────

const buildStats = (statistics: PageProps["statistics"]) => [
    {
        label: "Total Records",
        value: statistics.total,
        color: "bg-blue-50 border-blue-200",
        valueColor: "text-blue-800",
        dot: "bg-blue-400",
    },
    {
        label: "Pending",
        value: statistics.pending,
        color: "bg-amber-50 border-amber-200",
        valueColor: "text-amber-600",
        dot: "bg-amber-400",
    },
    {
        label: "Approved",
        value: statistics.approved,
        color: "bg-emerald-50 border-emerald-200",
        valueColor: "text-emerald-600",
        dot: "bg-emerald-400",
    },
    {
        label: "Rejected",
        value: statistics.rejected,
        color: "bg-red-50 border-red-200",
        valueColor: "text-red-600",
        dot: "bg-red-400",
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CvrsIndex() {
    const { props } = usePage<PageProps>();
    const {
        cvrs: cvrsData,
        state,
        types,
        statuses,
        filters,
        flash,
        statistics,
        permissions
    } = props;

    const [showModal, setShowModal] = useState(false);
    const [editCvr, setEditCvr] = useState<Cvr | null>(null);
    const [deleteCvr, setDeleteCvr] = useState<Cvr | null>(null);

    const stats = buildStats(statistics);

    useEffect(() => {
        if (flash?.message) {
            flash.status ? toast.success(flash.message) : toast.error(flash.message);
        }
    }, [flash]);

    const openCreate = () => {
        setEditCvr(null);
        setShowModal(true);
    };

    const openEdit = (cvr: Cvr) => {
        setEditCvr(cvr);
        setShowModal(true);
    };

    const openDelete = (cvr: Cvr) => setDeleteCvr(cvr);

    return (
        <>
            <Head title="CVR Records" />

            <AppLayout
                SideNavigation={AdminSidebar}
                title="CVR Records"
                sub="Manage continuous voter registration records"
                live
                actions={
                    permissions?.can_create && (
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                            font-['Syne',sans-serif] bg-primary text-primary-foreground
                            transition-all hover:opacity-90"
                        >
                            <IdCard size={15} />
                            Add CVR
                        </button>
                    )
                }
            >

                {/* ─── STATISTICS DASHBOARD ───────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {stats.map(({ label, value, color, valueColor, dot }) => (
                        <div
                            key={label}
                            className={`relative flex flex-col gap-3 p-4 rounded-xl border ${color} overflow-hidden`}
                        >
                            {/* ghost watermark number */}
                            <span
                                aria-hidden
                                className="pointer-events-none absolute -bottom-3 -right-1 text-7xl font-black opacity-[0.06] select-none leading-none"
                            >
                                {value.toLocaleString()}
                            </span>

                            <span className="flex items-center gap-1.5">
                                <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
                                <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                                    {label}
                                </span>
                            </span>

                            <span className={`text-2xl font-bold tabular-nums ${valueColor}`}>
                                {value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ─── TABLE ─────────────────────────────────────── */}
                <DataTable
                    data={cvrsData}
                    columns={[
                        {
                            key: "unique_id",
                            label: "Unique ID",
                            accessor: (row) => (
                                <span className="font-mono text-[12px] font-semibold">
                                    {row.unique_id}
                                </span>
                            ),
                        },
                        {
                            key: "type",
                            label: "Type",
                            accessor: (row) => (
                                <span className="capitalize">{row.type}</span>
                            ),
                        },
                        {
                            key: "status",
                            label: "Status",
                            accessor: (row) => (
                                <span className={`capitalize ${STATUS_COLORS[row.status] ?? ""}`}>
                                    {row.status}
                                </span>
                            ),
                        },
                        {
                            key: "created_at",
                            label: "Created",
                            accessor: (row) => (
                                <span className="text-xs text-muted-foreground">
                                    {new Date(row.created_at).toLocaleDateString()}
                                </span>
                            ),
                        },
                        { key: "actions", label: "Actions", type: "actions", align: "right" },
                    ]}
                    indexUrl={cvrs.index().url}
                    filters={filters}
                    filterConfigs={[
                        { key: "type", label: "Type", value: filters.type ?? "", options: types },
                        { key: "status", label: "Status", value: filters.status ?? "", options: statuses },
                    ]}
                    searchPlaceholder="Search unique ID..."
                    noun="records"
                    reloadOnly={["cvrs"]}
                    emptyIcon={<IdCard size={32} />}
                    renderActions={(row) => (
                        <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => openEdit(row)}>
                                <Pencil size={14} />
                            </button>
                            <button onClick={() => openDelete(row)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                />

                <CvrModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    state={state}
                    types={types}
                    statuses={statuses}
                    cvr={editCvr}
                />

                <DeleteCvrModal
                    open={!!deleteCvr}
                    onClose={() => setDeleteCvr(null)}
                    cvr={deleteCvr}
                />

            </AppLayout>
        </>
    );
}