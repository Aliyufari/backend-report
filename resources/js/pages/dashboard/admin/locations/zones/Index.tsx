import { useState, useEffect } from "react";
import { usePage, Head, useForm } from "@inertiajs/react";
import { Layers, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import DataTable from "@/components/ui/DataTable";
import {
    Label, FieldError, Input, Select, DeleteModal, LocationModalShell,
} from "@/components/locations/LocationPrimitives";

interface State { id: string; name: string; }
interface Zone {
    id: string; name: string;
    state: State;
    lgas_count: number; users_count: number; created_at: string;
}

interface PageProps {
    zones: { data: Zone[]; links: unknown[]; meta: Record<string, unknown> };
    states: State[];
    filters: { search?: string; state_id?: string };
    flash?: { status?: boolean; message?: string };
    [key: string]: unknown;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function ZoneModal({ open, onClose, zone, states }: {
    open: boolean; onClose: () => void; zone: Zone | null; states: State[];
}) {
    const isEdit = !!zone;
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: "", state_id: "",
    });

    useEffect(() => {
        if (!open) return;
        clearErrors();
        zone ? setData({ name: zone.name, state_id: zone.state?.id ?? "" }) : reset();
    }, [open, zone?.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => onClose(), onError: () => {} };
        isEdit
            ? put(`/admin/zones/${zone!.id}`, opts)
            : post(`/admin/zones`, opts);
    };

    return (
        <LocationModalShell open={open} onClose={onClose} title={isEdit ? "Edit Zone" : "Add Zone"}
            processing={processing} onSubmit={handleSubmit} isEdit={isEdit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label>Zone Name <span className="text-destructive">*</span></Label>
                    <Input type="text" placeholder="e.g. North West" value={data.name} error={errors.name}
                        onChange={(e) => setData("name", e.target.value)} />
                    <FieldError message={errors.name} />
                </div>
                <div>
                    <Label>State <span className="text-destructive">*</span></Label>
                    <Select value={data.state_id} error={errors.state_id}
                        onChange={(e) => setData("state_id", e.target.value)}>
                        <option value="">Select state</option>
                        {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                    <FieldError message={errors.state_id} />
                </div>
            </div>
        </LocationModalShell>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ZonesIndex() {
    const { props } = usePage<PageProps>();
    const { zones, states, filters, flash } = props;

    const [showModal,  setShowModal]  = useState(false);
    const [editZone,   setEditZone]   = useState<Zone | null>(null);
    const [deleteZone, setDeleteZone] = useState<Zone | null>(null);

    useEffect(() => {
        if (flash?.message) flash.status ? toast.success(flash.message) : toast.error(flash.message);
    }, [flash]);

    const columns = [
        {
            key: "name", label: "Zone",
            accessor: (row: Zone) => (
                <span className="font-['Syne',sans-serif] font-semibold text-[13px]">{row.name}</span>
            ),
        },
        {
            key: "state", label: "State",
            accessor: (row: Zone) => (
                <span className="inline-flex items-center px-2.5 py-[3px] rounded-full
                    font-['DM_Mono',monospace] text-[11px] font-medium capitalize whitespace-nowrap
                    text-primary bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]
                    border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                    {row.state?.name ?? "—"}
                </span>
            ),
        },
        {
            key: "lgas_count", label: "LGAs",
            accessor: (row: Zone) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{row.lgas_count}</span>
            ),
        },
        {
            key: "users_count", label: "Users",
            accessor: (row: Zone) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{row.users_count}</span>
            ),
        },
        {
            key: "created_at", label: "Created",
            accessor: (row: Zone) => (
                <span className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
            ),
        },
        { key: "actions", label: "Actions", type: "actions", align: "right" },
    ];

    return (
        <>
            <Head title="Manage Zones" />
            <AppLayout SideNavigation={AdminSidebar} title="Manage Zones"
                sub="Create and manage senatorial zones" live={false}
                actions={
                    <button onClick={() => { setEditZone(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                            font-['Syne',sans-serif] bg-primary text-primary-foreground transition-all hover:opacity-90">
                        <Plus size={15} /> Add Zone
                    </button>
                }
            >
                <DataTable
                    data={zones} columns={columns as any}
                    indexUrl="/admin/zones"
                    filters={filters as Record<string, string>}
                    filterConfigs={[{
                        key: "state_id", label: "State", value: filters.state_id ?? "",
                        options: states.map((s) => ({ value: s.id, label: s.name })),
                    }]}
                    searchPlaceholder="Search zones..." noun="zones"
                    reloadOnly={["zones"]}
                    emptyIcon={<Layers size={32} />} emptyMessage="No zones found"
                    renderActions={(row: Zone) => (
                        <div className="flex items-center justify-end gap-1.5">
                            <button title="Edit" onClick={() => { setEditZone(row); setShowModal(true); }}
                                className="w-[30px] h-[30px] rounded-[7px] inline-flex items-center justify-center
                                    border border-border bg-transparent cursor-pointer transition-all
                                    text-muted-foreground hover:bg-muted hover:text-foreground">
                                <Pencil size={13} />
                            </button>
                            <button title="Delete" onClick={() => setDeleteZone(row)}
                                className="w-[30px] h-[30px] rounded-[7px] inline-flex items-center justify-center
                                    border border-border bg-transparent cursor-pointer transition-all
                                    text-muted-foreground hover:bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)]
                                    hover:text-destructive hover:border-[color-mix(in_oklch,var(--destructive)_30%,transparent)]">
                                <Trash2 size={13} />
                            </button>
                        </div>
                    )}
                />
                <ZoneModal open={showModal} onClose={() => setShowModal(false)} zone={editZone} states={states} />
                <DeleteModal open={!!deleteZone} onClose={() => setDeleteZone(null)}
                    url={deleteZone ? `/admin/zones/${deleteZone.id}` : ""}
                    label="Zone" name={deleteZone?.name ?? ""} />
            </AppLayout>
        </>
    );
}