import { useState, useEffect } from "react";
import { usePage, Head } from "@inertiajs/react";
import { ClipboardCheck, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import DataTable from "@/components/ui/DataTable";

import AccreditationModal, { ELECTION_TYPE_LABELS, ElectionType } from "./AccreditationModal";
import DeleteAccreditationModal from "./DeleteAccreditationModal";

import accreditation from "@/routes/admin/manage-accreditation";

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

interface ElectionOption { 
    id: string; 
    title: string; 
    type?: ElectionType;
}

interface Accreditation {
    id: string;
    election_id: string;
    election?: { 
        id: string; 
        title: string; 
        type?: ElectionType;
    };
    pu_id: string;
    pu?: { id: string; code?: string; name: string; };
    accredited_voters: number;
    status: string;
    image_path: string | null;
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
    records: Paginated<Accreditation>;
    elections: ElectionOption[];
    locations: LocationNode[];
    locationScope: LocationScope;
    statuses: Option[];
    filters: any;
    flash?: any;
    permissions: {
        can_create: boolean;
    };
    statistics?: {
        total: number;
        pending: number;
        verified: number;
        flagged: number;
    };
    [key: string]: unknown;
}

// ─── Status Colors ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    pending: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    verified: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    flagged: "text-red-600 bg-red-500/10 border-red-500/20",
};

// ─── Stat Card Builder ────────────────────────────────────────────────────────

const buildStats = (statistics?: PageProps["statistics"]) => [
    {
        label: "Total Records",
        value: statistics?.total ?? 0,
        color: "bg-blue-50 border-blue-200",
        valueColor: "text-blue-700",
        dot: "bg-blue-400",
    },
    {
        label: "Pending",
        value: statistics?.pending ?? 0,
        color: "bg-amber-50 border-amber-200",
        valueColor: "text-amber-600",
        dot: "bg-amber-400",
    },
    {
        label: "Verified",
        value: statistics?.verified ?? 0,
        color: "bg-emerald-50 border-emerald-200",
        valueColor: "text-emerald-600",
        dot: "bg-emerald-400",
    },
    {
        label: "Flagged",
        value: statistics?.flagged ?? 0,
        color: "bg-red-50 border-red-200",
        valueColor: "text-red-600",
        dot: "bg-red-400",
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AccreditationIndex() {
    const { props } = usePage<PageProps>();

    const {
        records,
        elections,
        locations,
        locationScope,
        statuses,
        filters,
        flash,
        permissions,
        statistics,
    } = props;

    const stats = buildStats(statistics);

    const [showModal, setShowModal] = useState(false);
    const [editAccreditation, setEditAccreditation] = useState<Accreditation | null>(null);
    const [deleteAccreditation, setDeleteAccreditation] = useState<Accreditation | null>(null);

    useEffect(() => {
        if (!flash?.message) return;
        flash.status ? toast.success(flash.message) : toast.error(flash.message);
    }, [flash]);

    const openCreate = () => {
        setEditAccreditation(null);
        setShowModal(true);
    };

    const openEdit = (record: Accreditation) => {
        setEditAccreditation(record);
        setShowModal(true);
    };

    const openDelete = (record: Accreditation) => {
        setDeleteAccreditation(record);
    };

    return (
        <>
            <Head title="Manage Accreditation" />

            <AppLayout
                SideNavigation={AdminSidebar}
                title="Manage Accreditation"
                sub="Upload and manage polling unit accreditation records"
                live
                actions={
                    permissions?.can_create && (
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                            font-['Syne',sans-serif] bg-primary text-primary-foreground
                            transition-all hover:opacity-90 cursor-pointer"
                        >
                            <ClipboardCheck size={15} />
                            Add Accreditation
                        </button>
                    )
                }
            >
                {/* ─── STATISTICS ─── */}
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
                                <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                                    {label}
                                </span>
                            </span>

                            <span className={`text-2xl font-bold tabular-nums ${valueColor}`}>
                                {value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ─── TABLE ─── */}
                <DataTable
                    data={records}
                    columns={[
                        {
                            key: "election",
                            label: "Election",
                            accessor: (row) => (
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold font-['Syne',sans-serif] text-sm">
                                        {row.election?.title ?? "—"}
                                    </span>
                                    {row.election?.type && (
                                        <span className="inline-flex w-max px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                                            {ELECTION_TYPE_LABELS[row.election.type] ?? row.election.type}
                                        </span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            key: "pu",
                            label: "Polling Unit",
                            accessor: (row) => (
                                <span className="text-xs text-muted-foreground font-['DM_Mono',monospace]">
                                    {row.pu?.code ? `${row.pu.code} - ${row.pu.name}` : row.pu?.name ?? "—"}
                                </span>
                            ),
                        },
                        {
                            key: "accredited_voters",
                            label: "Accredited",
                            accessor: (row) => (
                                <span className="font-semibold text-primary font-['DM_Mono',monospace]">
                                    {row.accredited_voters.toLocaleString()}
                                </span>
                            ),
                        },
                        {
                            key: "status",
                            label: "Status",
                            accessor: (row) => (
                                <span className={`capitalize inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_COLORS[row.status] ?? ""}`}>
                                    {row.status}
                                </span>
                            ),
                        },
                        {
                            key: "image_path",
                            label: "Image",
                            accessor: (row) =>
                                row.image_path ? (
                                    <span className="text-emerald-600 text-xs font-mono font-medium">
                                        ✓ Uploaded
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground text-xs font-mono">
                                        None
                                    </span>
                                ),
                        },
                        {
                            key: "actions",
                            label: "Actions",
                            type: "actions",
                            align: "right",
                        },
                    ]}
                    indexUrl={accreditation.index().url}
                    filters={filters}
                    filterConfigs={[
                        {
                            key: "election_id",
                            label: "Election",
                            value: filters.election_id ?? "",
                            options: elections.map((e) => ({
                                value: e.id,
                                label: e.type ? `${e.title} (${ELECTION_TYPE_LABELS[e.type] ?? e.type})` : e.title,
                            })),
                        },
                        {
                            key: "status",
                            label: "Status",
                            value: filters.status ?? "",
                            options: statuses,
                        },
                    ]}
                    searchPlaceholder="Search accreditation..."
                    noun="accreditation records"
                    reloadOnly={["records"]}
                    emptyIcon={<ClipboardCheck size={32} />}
                    renderActions={(row) => (
                        <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => openEdit(row)} className="cursor-pointer hover:text-primary transition-colors">
                                <Pencil size={14} />
                            </button>

                            <button onClick={() => openDelete(row)} className="cursor-pointer hover:text-destructive transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                />

                <AccreditationModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    elections={elections}
                    locations={locations}
                    locationScope={locationScope}
                    statuses={statuses}
                    accreditation={editAccreditation}
                />

                <DeleteAccreditationModal
                    open={!!deleteAccreditation}
                    onClose={() => setDeleteAccreditation(null)}
                    accreditation={deleteAccreditation}
                />
            </AppLayout>
        </>
    );
}