import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { Vote, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import ElectionModal from "./ElectionModal";
import DeleteElectionModal from "./DeleteElectionModal";
import DataTable from "@/components/ui/DataTable";
import { index as elections } from "@/routes/admin/elections";

interface Option { value: string; label: string; }

interface Election {
    id: string;
    title: string;
    type: string | null;
    election_date: string | null;
    status: string;
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
    elections: Paginated<Election>;
    filters: any;
    statuses: Option[];
    flash?: any;
    statistics: { total: number; upcoming: number; ongoing: number; completed: number };
    permissions: { can_create: boolean };
    [key: string]: unknown;
}

const STATUS_COLORS: Record<string, string> = {
    upcoming: "text-blue-600",
    ongoing: "text-emerald-600",
    completed: "text-zinc-500",
};

const buildStats = (statistics: PageProps["statistics"]) => [
    { label: "Total Elections", value: statistics.total, color: "bg-blue-50 border-blue-200", valueColor: "text-blue-800", dot: "bg-blue-400" },
    { label: "Upcoming", value: statistics.upcoming, color: "bg-indigo-50 border-indigo-200", valueColor: "text-indigo-600", dot: "bg-indigo-400" },
    { label: "Ongoing", value: statistics.ongoing, color: "bg-emerald-50 border-emerald-200", valueColor: "text-emerald-600", dot: "bg-emerald-400" },
    { label: "Completed", value: statistics.completed, color: "bg-zinc-50 border-zinc-200", valueColor: "text-zinc-600", dot: "bg-zinc-400" },
];

export default function ElectionsIndex() {
    const { props } = usePage<PageProps>();
    const { elections: electionsData, filters, statuses, flash, statistics, permissions } = props;

    const [showModal, setShowModal] = useState(false);
    const [editElection, setEditElection] = useState<Election | null>(null);
    const [deleteElection, setDeleteElection] = useState<Election | null>(null);

    const stats = buildStats(statistics);

    useEffect(() => {
        if (flash?.message) {
            flash.status ? toast.success(flash.message) : toast.error(flash.message);
        }
    }, [flash]);

    const openCreate = () => { setEditElection(null); setShowModal(true); };
    const openEdit = (election: Election) => { setEditElection(election); setShowModal(true); };
    const openDelete = (election: Election) => setDeleteElection(election);

    return (
        <>
            <Head title="Manage Elections" />
            <AppLayout
                SideNavigation={AdminSidebar}
                title="Manage Elections"
                sub="Create and manage election records"
                live
                actions={
                    permissions?.can_create && (
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                            font-['Syne',sans-serif] bg-primary text-primary-foreground
                            transition-all hover:opacity-90"
                        >
                            <Vote size={15} />
                            Add Election
                        </button>
                    )
                }
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {stats.map(({ label, value, color, valueColor, dot }) => (
                        <div key={label} className={`relative flex flex-col gap-3 p-4 rounded-xl border ${color} overflow-hidden`}>
                            <span aria-hidden className="pointer-events-none absolute -bottom-3 -right-1 text-7xl font-black opacity-[0.06] select-none leading-none">
                                {value.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
                                <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{label}</span>
                            </span>
                            <span className={`text-2xl font-bold tabular-nums ${valueColor}`}>{value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                <DataTable
                    data={electionsData}
                    columns={[
                        {
                            key: "title",
                            label: "Election",
                            accessor: (row) => (
                                <div>
                                    <p className="font-['Syne',sans-serif] font-semibold text-[13px]">{row.title}</p>
                                    {row.type && <p className="text-[11px] text-muted-foreground font-['DM_Mono',monospace]">{row.type}</p>}
                                </div>
                            ),
                        },
                        {
                            key: "election_date",
                            label: "Date",
                            accessor: (row) => (
                                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">
                                    {row.election_date ? new Date(row.election_date).toLocaleDateString() : "—"}
                                </span>
                            ),
                        },
                        {
                            key: "status",
                            label: "Status",
                            accessor: (row) => (
                                <span className={`capitalize ${STATUS_COLORS[row.status] ?? ""}`}>{row.status}</span>
                            ),
                        },
                        { key: "actions", label: "Actions", type: "actions", align: "right" },
                    ]}
                    indexUrl={elections().url}
                    filters={filters}
                    filterConfigs={[{ key: "status", label: "Status", value: filters.status ?? "", options: statuses }]}
                    searchPlaceholder="Search elections..."
                    noun="elections"
                    reloadOnly={["elections"]}
                    emptyIcon={<Vote size={32} />}
                    renderActions={(row) => (
                        <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => openEdit(row)}><Pencil size={14} /></button>
                            <button onClick={() => openDelete(row)}><Trash2 size={14} /></button>
                        </div>
                    )}
                />

                <ElectionModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    statuses={statuses}
                    election={editElection}
                />

                <DeleteElectionModal
                    open={!!deleteElection}
                    onClose={() => setDeleteElection(null)}
                    election={deleteElection}
                />
            </AppLayout>
        </>
    );
}