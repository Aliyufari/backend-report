import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { Vote, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import ResultModal from "./ResultModal";
import DeleteResultModal from "./DeleteResultModal";
import DataTable from "@/components/ui/DataTable";
import { index as results } from "@/routes/admin/manage-results";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PuOption {
    id: string;
    code?: string;
    name: string;
}

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

interface Option {
    value: string;
    label: string;
}

interface ElectionOption {
    id: string;
    title: string;
}

interface Result {
    id: string;
    election_id: string;
    election?: {
        id: string;
        title: string;
    };
    pu_id: string;
    pu?: {
        id: string;
        name: string;
        code?: string;
    };
    total_votes: number;
    party_votes: Record<string, number> | null;
    status: string;
    image_path: string | null;
    created_at: string;
    [key: string]: unknown;
}

interface Paginated<T> {
    data: T[];
    links: unknown[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface PageProps {
    records: Paginated<Result>;
    elections: ElectionOption[];
    locations: LocationNode[];
    locationScope: LocationScope;
    statuses: Option[];
    parties: Option[];
    filters: {
        search?: string;
        election_id?: string;
        status?: string;
    };
    flash?: {
        status?: boolean;
        message?: string;
    };
    permissions: {
        can_create: boolean;
    };
    [key: string]: unknown;
}

const STATUS_COLORS: Record<string, string> = {
    pending: "text-amber-600",
    verified: "text-emerald-600",
    flagged: "text-red-600",
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ResultsIndex() {
    const { props } = usePage<PageProps>();

    const {
        records,
        elections,
        locations,
        locationScope,
        statuses,
        parties,
        filters,
        flash,
        permissions,
    } = props;

    const [showModal, setShowModal] = useState(false);
    const [editResult, setEditResult] = useState<Result | null>(null);
    const [deleteResult, setDeleteResult] = useState<Result | null>(null);

    useEffect(() => {
        if (flash?.message) {
            flash.status
                ? toast.success(flash.message)
                : toast.error(flash.message);
        }
    }, [flash]);

    const openCreate = () => {
        setEditResult(null);
        setShowModal(true);
    };

    const openEdit = (result: Result) => {
        setEditResult(result);
        setShowModal(true);
    };

    const openDelete = (result: Result) => {
        setDeleteResult(result);
    };

    return (
        <>
            <Head title="Manage Results" />

            <AppLayout
                SideNavigation={AdminSidebar}
                title="Manage Results"
                sub="Upload and manage polling unit election results"
                live
                actions={
                    permissions.can_create && (
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                            font-['Syne',sans-serif] bg-primary text-primary-foreground
                            transition-all hover:opacity-90"
                        >
                            <Vote size={15} />
                            Add Result
                        </button>
                    )
                }
            >
                <DataTable
                    data={records}
                    columns={[
                        {
                            key: "election",
                            label: "Election",
                            accessor: (row) => (
                                <span className="font-['Syne',sans-serif] font-semibold text-[13px]">
                                    {row.election?.title ?? "—"}
                                </span>
                            ),
                        },
                        {
                            key: "pu",
                            label: "Polling Unit",
                            accessor: (row) => (
                                <span className="text-xs text-muted-foreground font-['DM_Mono',monospace]">
                                    {row.pu?.code
                                        ? `${row.pu.code} - ${row.pu.name}`
                                        : row.pu?.name ?? "—"}
                                </span>
                            ),
                        },
                        {
                            key: "total_votes",
                            label: "Total Votes",
                            accessor: (row) => (
                                <span className="font-['DM_Mono',monospace] text-[12px] font-semibold text-primary">
                                    {row.total_votes.toLocaleString()}
                                </span>
                            ),
                        },
                        {
                            key: "status",
                            label: "Status",
                            accessor: (row) => (
                                <span
                                    className={`capitalize ${
                                        STATUS_COLORS[row.status] ?? ""
                                    }`}
                                >
                                    {row.status}
                                </span>
                            ),
                        },
                        {
                            key: "image_path",
                            label: "Image",
                            accessor: (row) =>
                                row.image_path ? (
                                    <span className="text-[11px] text-emerald-600 font-['DM_Mono',monospace]">
                                        ✓ Uploaded
                                    </span>
                                ) : (
                                    <span className="text-[11px] text-muted-foreground font-['DM_Mono',monospace]">
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
                    indexUrl={results().url}
                    filters={filters}
                    filterConfigs={[
                        {
                            key: "election_id",
                            label: "Election",
                            value: filters.election_id ?? "",
                            options: elections.map((e) => ({
                                value: e.id,
                                label: e.title,
                            })),
                        },
                        {
                            key: "status",
                            label: "Status",
                            value: filters.status ?? "",
                            options: statuses,
                        },
                    ]}
                    searchPlaceholder="Search results..."
                    noun="results"
                    reloadOnly={["records"]}
                    emptyIcon={<Vote size={32} />}
                    emptyMessage="No results found"
                    renderActions={(row) => (
                        <div className="flex items-center gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => openEdit(row)}
                                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center
                                           hover:bg-muted transition-colors"
                            >
                                <Pencil size={14} />
                            </button>

                            <button
                                type="button"
                                onClick={() => openDelete(row)}
                                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center
                                           hover:text-destructive hover:border-destructive/30
                                           transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                />

                <ResultModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    elections={elections}
                    locations={locations}
                    locationScope={locationScope}
                    statuses={statuses}
                    parties={parties}
                    result={editResult}
                />

                <DeleteResultModal
                    open={!!deleteResult}
                    onClose={() => setDeleteResult(null)}
                    result={deleteResult}
                />
            </AppLayout>
        </>
    );
}