import { useEffect } from "react";
import { usePage, Head } from "@inertiajs/react";
import { Cpu } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import GovernorSidebar from "@/components/sidebar/GovernorSidebar";
import DataTable from "@/components/ui/DataTable";
import bivas from "@/routes/governor/bivas";

// ─── Types ────────────────────────────────────────────────────────────────────

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
        statuses,
        filters,
        flash,
        statistics,
    } = props;

    const stats = buildStats(statistics);

    useEffect(() => {
        if (flash?.message) {
            flash.status ? toast.success(flash.message) : toast.error(flash.message);
        }
    }, [flash]);

    return (
        <>
            <Head title="BIVAS Machines" />

            <AppLayout
                SideNavigation={GovernorSidebar}
                title="BIVAS Machines"
                sub="Biometric voter accreditation machines across your state"
                live
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
                />
            </AppLayout>
        </>
    );
}