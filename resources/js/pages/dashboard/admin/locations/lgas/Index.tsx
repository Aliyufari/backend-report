import { useState, useEffect } from "react";
import { usePage, Head, useForm } from "@inertiajs/react";
import { Building2, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import DataTable from "@/components/ui/DataTable";
import {
    Label, FieldError, Input, Select, DeleteModal, LocationModalShell,
} from "@/components/locations/LocationPrimitives";

interface Zone  { id: string; name: string; }
interface State { id: string; name: string; zones: Zone[]; }
interface Lga {
    id: string; name: string;
    zone: Zone & { state: { id: string; name: string } };
    wards_count: number; users_count: number; created_at: string;
}

interface PageProps {
    lgas: { data: Lga[]; links: unknown[]; meta: Record<string, unknown> };
    states: State[];
    filters: { search?: string; zone_id?: string; state_id?: string };
    flash?: { status?: boolean; message?: string };
    [key: string]: unknown;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function LgaModal({ open, onClose, lga, states }: {
    open: boolean; onClose: () => void; lga: Lga | null; states: State[];
}) {
    const isEdit = !!lga;
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: "", zone_id: "",
    });

    const [selStateId, setSelStateId] = useState("");
    const selState = states.find((s) => s.id === selStateId) ?? null;

    useEffect(() => {
        if (!open) return;
        clearErrors();
        if (lga) {
            setData({ name: lga.name, zone_id: lga.zone?.id ?? "" });
            setSelStateId(lga.zone?.state?.id ?? "");
        } else {
            reset();
            setSelStateId("");
        }
    }, [open, lga?.id]);

    const handleStateChange = (id: string) => {
        setSelStateId(id);
        setData("zone_id", "");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => onClose(), onError: () => {} };
        isEdit
            ? put(`/admin/lgas/${lga!.id}`, opts)
            : post(`/admin/lgas`, opts);
    };

    return (
        <LocationModalShell open={open} onClose={onClose} title={isEdit ? "Edit LGA" : "Add LGA"}
            processing={processing} onSubmit={handleSubmit} isEdit={isEdit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <Label>LGA Name <span className="text-destructive">*</span></Label>
                    <Input type="text" placeholder="e.g. Kano Municipal" value={data.name} error={errors.name}
                        onChange={(e) => setData("name", e.target.value)} />
                    <FieldError message={errors.name} />
                </div>
                <div>
                    <Label>State <span className="text-destructive">*</span></Label>
                    <Select value={selStateId} onChange={(e) => handleStateChange(e.target.value)}>
                        <option value="">Select state</option>
                        {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                </div>
                <div>
                    <Label>Zone <span className="text-destructive">*</span></Label>
                    <Select value={data.zone_id} error={errors.zone_id} disabled={!selStateId}
                        onChange={(e) => setData("zone_id", e.target.value)}>
                        <option value="">Select zone</option>
                        {selState?.zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </Select>
                    <FieldError message={errors.zone_id} />
                </div>
            </div>
        </LocationModalShell>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LgasIndex() {
    const { props } = usePage<PageProps>();
    const { lgas, states, filters, flash } = props;

    const [showModal, setShowModal] = useState(false);
    const [editLga,   setEditLga]   = useState<Lga | null>(null);
    const [deleteLga, setDeleteLga] = useState<Lga | null>(null);

    useEffect(() => {
        if (flash?.message) flash.status ? toast.success(flash.message) : toast.error(flash.message);
    }, [flash]);

    const allZones = states.flatMap((s) => s.zones);

    const columns = [
        {
            key: "name", label: "LGA",
            accessor: (row: Lga) => (
                <span className="font-['Syne',sans-serif] font-semibold text-[13px]">{row.name}</span>
            ),
        },
        {
            key: "zone", label: "Zone",
            accessor: (row: Lga) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{row.zone?.name ?? "—"}</span>
            ),
        },
        {
            key: "state", label: "State",
            accessor: (row: Lga) => (
                <span className="inline-flex items-center px-2.5 py-[3px] rounded-full
                    font-['DM_Mono',monospace] text-[11px] font-medium capitalize whitespace-nowrap
                    text-primary bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]
                    border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                    {row.zone?.state?.name ?? "—"}
                </span>
            ),
        },
        {
            key: "wards_count", label: "Wards",
            accessor: (row: Lga) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{row.wards_count}</span>
            ),
        },
        {
            key: "created_at", label: "Created",
            accessor: (row: Lga) => (
                <span className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
            ),
        },
        { key: "actions", label: "Actions", type: "actions", align: "right" },
    ];

    return (
        <>
            <Head title="Manage LGAs" />
            <AppLayout SideNavigation={AdminSidebar} title="Manage LGAs"
                sub="Create and manage local government areas" live={false}
                actions={
                    <button onClick={() => { setEditLga(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                            font-['Syne',sans-serif] bg-primary text-primary-foreground transition-all hover:opacity-90">
                        <Plus size={15} /> Add LGA
                    </button>
                }
            >
                <DataTable
                    data={lgas} columns={columns as any}
                    indexUrl="/admin/lgas"
                    filters={filters as Record<string, string>}
                    filterConfigs={[{
                        key: "zone_id", label: "Zone", value: filters.zone_id ?? "",
                        options: allZones.map((z) => ({ value: z.id, label: z.name })),
                    }]}
                    searchPlaceholder="Search LGAs..." noun="LGAs"
                    reloadOnly={["lgas"]}
                    emptyIcon={<Building2 size={32} />} emptyMessage="No LGAs found"
                    renderActions={(row: Lga) => (
                        <div className="flex items-center justify-end gap-1.5">
                            <button title="Edit" onClick={() => { setEditLga(row); setShowModal(true); }}
                                className="w-[30px] h-[30px] rounded-[7px] inline-flex items-center justify-center
                                    border border-border bg-transparent cursor-pointer transition-all
                                    text-muted-foreground hover:bg-muted hover:text-foreground">
                                <Pencil size={13} />
                            </button>
                            <button title="Delete" onClick={() => setDeleteLga(row)}
                                className="w-[30px] h-[30px] rounded-[7px] inline-flex items-center justify-center
                                    border border-border bg-transparent cursor-pointer transition-all
                                    text-muted-foreground hover:bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)]
                                    hover:text-destructive hover:border-[color-mix(in_oklch,var(--destructive)_30%,transparent)]">
                                <Trash2 size={13} />
                            </button>
                        </div>
                    )}
                />
                <LgaModal open={showModal} onClose={() => setShowModal(false)} lga={editLga} states={states} />
                <DeleteModal open={!!deleteLga} onClose={() => setDeleteLga(null)}
                    url={deleteLga ? `/admin/lgas/${deleteLga.id}` : ""}
                    label="LGA" name={deleteLga?.name ?? ""} />
            </AppLayout>
        </>
    );
}