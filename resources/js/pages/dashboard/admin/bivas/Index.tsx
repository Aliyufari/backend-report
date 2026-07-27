import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { Cpu, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import BivasModal from "./BivasModal";
import DeleteBivasModal from "./DeleteBivasModal";
import DataTable from "@/components/ui/DataTable";
import bivas from "@/routes/admin/bivas";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PuOption { id: string; code?: string; name: string; }

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

interface Option { value: string; label: string; }

interface Machine {
    id: string;
    serial_number: string;
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
    machines: Paginated<Machine>;
    locations: LocationNode[];
    locationScope: LocationScope;
    statuses: Option[];
    filters: any;
    flash?: any;

    statistics: {
        total: number;
        active: number;
        inactive: number;
        faulty: number;
        maintenance: number;
    };

    permissions: {
        can_create: boolean;
    };

    [key: string]: unknown;
}

// ─── Badge config ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    active: "text-emerald-600",
    inactive: "text-zinc-500",
    faulty: "text-red-600",
    maintenance: "text-amber-600",
};

// ─── Stat card config ─────────────────────────────────────────────────────────

const buildStats = (statistics: PageProps["statistics"]) => [
    {
        label: "Total Machines",
        value: statistics.total,
        color: "bg-blue-50 border-blue-200",
        valueColor: "text-blue-800",
        dot: "bg-blue-400",
    },
    {
        label: "Active",
        value: statistics.active,
        color: "bg-emerald-50 border-emerald-200",
        valueColor: "text-emerald-600",
        dot: "bg-emerald-400",
    },
    {
        label: "Faulty",
        value: statistics.faulty,
        color: "bg-red-50 border-red-200",
        valueColor: "text-red-600",
        dot: "bg-red-400",
    },
    {
        label: "Maintenance",
        value: statistics.maintenance,
        color: "bg-amber-50 border-amber-200",
        valueColor: "text-amber-600",
        dot: "bg-amber-400",
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BivasIndex() {
    const { props } = usePage<PageProps>();
    const {
        machines: machinesData,
        locations,
        locationScope,
        statuses,
        filters,
        flash,
        statistics,
        permissions
    } = props;

    const [showModal, setShowModal] = useState(false);
    const [editMachine, setEditMachine] = useState<Machine | null>(null);
    const [deleteMachine, setDeleteMachine] = useState<Machine | null>(null);

    const stats = buildStats(statistics);

    useEffect(() => {
        if (flash?.message) {
            flash.status ? toast.success(flash.message) : toast.error(flash.message);
        }
    }, [flash]);

    const openCreate = () => {
        setEditMachine(null);
        setShowModal(true);
    };

    const openEdit = (machine: Machine) => {
        setEditMachine(machine);
        setShowModal(true);
    };

    const openDelete = (machine: Machine) => setDeleteMachine(machine);

    return (
        <>
            <Head title="BIVAS Machines" />

            <AppLayout
                SideNavigation={AdminSidebar}
                title="BIVAS Machines"
                sub="Manage biometric voter accreditation machines"
                live
                actions={
                    permissions?.can_create && (
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                            font-['Syne',sans-serif] bg-primary text-primary-foreground
                            transition-all hover:opacity-90"
                        >
                            <Cpu size={15} />
                            Add Machine
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
                    data={machinesData}
                    columns={[
                        {
                            key: "serial_number",
                            label: "Serial Number",
                            accessor: (row) => (
                                <span className="font-mono text-[12px] font-semibold">
                                    {row.serial_number}
                                </span>
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
                            key: "pu",
                            label: "Assigned PU",
                            accessor: (row) => (
                                <span className="text-xs text-muted-foreground">
                                    {row.pu?.name ?? "—"}
                                </span>
                            ),
                        },
                        {
                            key: "created_at",
                            label: "Registered",
                            accessor: (row) => (
                                <span className="text-xs text-muted-foreground">
                                    {new Date(row.created_at).toLocaleDateString()}
                                </span>
                            ),
                        },
                        { key: "actions", label: "Actions", type: "actions", align: "right" },
                    ]}
                    indexUrl={bivas.index().url}
                    filters={filters}
                    filterConfigs={[
                        { key: "status", label: "Status", value: filters.status ?? "", options: statuses },
                    ]}
                    searchPlaceholder="Search serial number..."
                    noun="machines"
                    reloadOnly={["machines"]}
                    emptyIcon={<Cpu size={32} />}
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

                <BivasModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    locations={locations}
                    locationScope={locationScope}
                    statuses={statuses}
                    machine={editMachine}
                />

                <DeleteBivasModal
                    open={!!deleteMachine}
                    onClose={() => setDeleteMachine(null)}
                    machine={deleteMachine}
                />

            </AppLayout>
        </>
    );
}