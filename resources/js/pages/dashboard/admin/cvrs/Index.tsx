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

interface Pu    { id: string; name: string; number?: string; ward?: { id: string; name: string; lga?: { id: string; name: string; zone?: { id: string; name: string; state?: { id: string; name: string } } } }; }
interface Ward  { id: string; name: string; pus:   Pu[];    }
interface Lga   { id: string; name: string; wards: Ward[];  }
interface Zone  { id: string; name: string; lgas:  Lga[];   }
interface State { id: string; name: string; zones: Zone[];  }
interface Option { value: string; label: string; }

interface CvrPu {
    id: string; name: string; number?: string;
    ward?: { id: string; name: string; lga?: { id: string; name: string } };
}

interface Cvr {
    id: string; unique_id: string;
    type: string; status: string; pu_id: string;
    pu?: CvrPu;
    created_at: string;
    [key: string]: unknown;
}

interface Paginated<T> {
    data: T[]; links: { url: string | null; label: string; active: boolean }[];
    current_page: number; last_page: number;
    total: number; from: number; to: number;
}

interface PageProps {
    cvrs:     Paginated<Cvr>;
    state:    State[];
    types:    Option[];
    statuses: Option[];
    filters:  { search?: string; type?: string; status?: string; pu?: string };
    flash?:   { status?: boolean; message?: string };
    [key: string]: unknown;
}

// ─── Badge config ─────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    registration: { bg: "bg-blue-500/10",   text: "text-blue-500",   border: "border-blue-500/20"   },
    update:       { bg: "bg-amber-500/10",  text: "text-amber-600",  border: "border-amber-500/20"  },
    transfer:     { bg: "bg-violet-500/10", text: "text-violet-600", border: "border-violet-500/20" },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    pending:  { bg: "bg-amber-500/10",   text: "text-amber-600",  border: "border-amber-500/20"  },
    approved: { bg: "bg-emerald-500/10", text: "text-emerald-600",border: "border-emerald-500/20" },
    rejected: { bg: "bg-red-500/10",     text: "text-red-600",    border: "border-red-500/20"    },
};

const FALLBACK = { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };

function Badge({ value, map }: { value: string; map: Record<string, { bg: string; text: string; border: string }> }) {
    const cfg = map[value] ?? FALLBACK;
    return (
        <span className={`inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px]
            font-['DM_Mono',monospace] font-medium capitalize whitespace-nowrap
            border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            {value}
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CvrsIndex() {
    const { props } = usePage<PageProps>();
    const { cvrs: cvrsData, state, types, statuses, filters, flash } = props;

    const [showModal,  setShowModal]  = useState(false);
    const [editCvr,    setEditCvr]    = useState<Cvr | null>(null);
    const [deleteCvr,  setDeleteCvr]  = useState<Cvr | null>(null);

    useEffect(() => {
        if (flash?.message) {
            flash.status ? toast.success(flash.message) : toast.error(flash.message);
        }
    }, [flash]);

    const openCreate = () => { setEditCvr(null); setShowModal(true); };
    const openEdit   = (cvr: Cvr) => { setEditCvr(cvr); setShowModal(true); };
    const openDelete = (cvr: Cvr) => setDeleteCvr(cvr);

    // ── Column definitions ────────────────────────────────────────────────────

    const columns: Column<Cvr>[] = [
        {
            key: "unique_id",
            label: "Unique ID",
            accessor: (row) => (
                <span className="font-['DM_Mono',monospace] font-semibold text-[12px] tracking-[0.05em]">
                    {row.unique_id}
                </span>
            ),
        },
        {
            key: "type",
            label: "Type",
            accessor: (row) => <Badge value={row.type} map={TYPE_COLORS} />,
        },
        {
            key: "status",
            label: "Status",
            accessor: (row) => <Badge value={row.status} map={STATUS_COLORS} />,
        },
        {
            key: "pu",
            label: "Polling Unit",
            accessor: (row) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-foreground">
                    {row.pu?.number ? `${row.pu.number} — ` : ""}{row.pu?.name ?? "—"}
                </span>
            ),
        },
        {
            key: "ward",
            label: "Ward",
            accessor: (row) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">
                    {row.pu?.ward?.name ?? "—"}
                </span>
            ),
        },
        {
            key: "lga",
            label: "LGA",
            accessor: (row) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">
                    {row.pu?.ward?.lga?.name ?? "—"}
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
            <Head title="CVR Records" />
            <AppLayout
                SideNavigation={AdminSidebar}
                title="CVR Records"
                sub="Manage continuous voter registration records"
                live
                actions={
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                            font-['Syne',sans-serif] bg-primary text-primary-foreground
                            transition-all hover:opacity-90"
                    >
                        <IdCard size={15} />
                        Add CVR
                    </button>
                }
            >
                <DataTable
                    data={cvrsData}
                    columns={columns}
                    indexUrl={cvrs.index().url}
                    filters={filters as Record<string, string>}
                    filterConfigs={[
                        {
                            key: "type",
                            label: "Type",
                            value: filters.type ?? "",
                            options: types,
                        },
                        {
                            key: "status",
                            label: "Status",
                            value: filters.status ?? "",
                            options: statuses,
                        },
                    ]}
                    searchPlaceholder="Search unique ID..."
                    noun="records"
                    reloadOnly={["cvrs"]}
                    emptyIcon={<IdCard size={32} />}
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