import { useState, useEffect } from "react";
import { usePage, Head, useForm } from "@inertiajs/react";
import { MapPin, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import DataTable from "@/components/ui/DataTable";
import {
    Label, FieldError, Input, DeleteModal, LocationModalShell,
} from "@/components/locations/LocationPrimitives";

interface State {
    id: string;
    name: string;
    zones_count: number;
    users_count: number;
    created_at: string;
}

interface PageProps {
    states: { data: State[]; links: unknown[]; meta: Record<string, unknown> };
    filters: { search?: string };
    flash?: { status?: boolean; message?: string };
    [key: string]: unknown;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function StateModal({ open, onClose, state }: { open: boolean; onClose: () => void; state: State | null }) {
    const isEdit = !!state;
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({ name: "" });

    useEffect(() => {
        if (!open) return;
        clearErrors();
        state ? setData({ name: state.name }) : reset();
    }, [open, state?.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => onClose(), onError: () => {} };
        isEdit
            ? put(`/admin/states/${state!.id}`, opts)
            : post(`/admin/states`, opts);
    };

    return (
        <LocationModalShell open={open} onClose={onClose} title={isEdit ? "Edit State" : "Add State"}
            processing={processing} onSubmit={handleSubmit} isEdit={isEdit}>
            <div>
                <Label>State Name <span className="text-destructive">*</span></Label>
                <Input type="text" placeholder="e.g. Kano" value={data.name} error={errors.name}
                    onChange={(e) => setData("name", e.target.value)} />
                <FieldError message={errors.name} />
            </div>
        </LocationModalShell>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StatesIndex() {
    const { props } = usePage<PageProps>();
    const { states, filters, flash } = props;

    const [showModal,   setShowModal]   = useState(false);
    const [editState,   setEditState]   = useState<State | null>(null);
    const [deleteState, setDeleteState] = useState<State | null>(null);

    useEffect(() => {
        if (flash?.message) flash.status ? toast.success(flash.message) : toast.error(flash.message);
    }, [flash]);

    const columns = [
        {
            key: "name", label: "State",
            accessor: (row: State) => (
                <span className="font-['Syne',sans-serif] font-semibold text-[13px]">{row.name}</span>
            ),
        },
        {
            key: "zones_count", label: "Zones",
            accessor: (row: State) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{row.zones_count}</span>
            ),
        },
        {
            key: "users_count", label: "Users",
            accessor: (row: State) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{row.users_count}</span>
            ),
        },
        {
            key: "created_at", label: "Created",
            accessor: (row: State) => (
                <span className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
            ),
        },
        { key: "actions", label: "Actions", type: "actions", align: "right" },
    ];

    return (
        <>
            <Head title="Manage States" />
            <AppLayout SideNavigation={AdminSidebar} title="Manage States"
                sub="Create and manage states" live={false}
                actions={
                    <button onClick={() => { setEditState(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                            font-['Syne',sans-serif] bg-primary text-primary-foreground transition-all hover:opacity-90">
                        <Plus size={15} /> Add State
                    </button>
                }
            >
                <DataTable
                    data={states} columns={columns as any}
                    indexUrl="/admin/states"
                    filters={filters as Record<string, string>}
                    searchPlaceholder="Search states..." noun="states"
                    reloadOnly={["states"]}
                    emptyIcon={<MapPin size={32} />} emptyMessage="No states found"
                    renderActions={(row: State) => (
                        <div className="flex items-center justify-end gap-1.5">
                            <button title="Edit" onClick={() => { setEditState(row); setShowModal(true); }}
                                className="w-[30px] h-[30px] rounded-[7px] inline-flex items-center justify-center
                                    border border-border bg-transparent cursor-pointer transition-all
                                    text-muted-foreground hover:bg-muted hover:text-foreground">
                                <Pencil size={13} />
                            </button>
                            <button title="Delete" onClick={() => setDeleteState(row)}
                                className="w-[30px] h-[30px] rounded-[7px] inline-flex items-center justify-center
                                    border border-border bg-transparent cursor-pointer transition-all
                                    text-muted-foreground hover:bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)]
                                    hover:text-destructive hover:border-[color-mix(in_oklch,var(--destructive)_30%,transparent)]">
                                <Trash2 size={13} />
                            </button>
                        </div>
                    )}
                />
                <StateModal open={showModal} onClose={() => setShowModal(false)} state={editState} />
                <DeleteModal open={!!deleteState} onClose={() => setDeleteState(null)}
                    url={deleteState ? `/admin/states/${deleteState.id}` : ""}
                    label="State" name={deleteState?.name ?? ""} />
            </AppLayout>
        </>
    );
}