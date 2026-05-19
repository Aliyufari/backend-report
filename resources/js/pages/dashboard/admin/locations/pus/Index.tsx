import { useState, useEffect } from "react";
import { usePage, Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { CircleDot, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import DataTable from "@/components/ui/DataTable";
import {
    Label, FieldError, Input, Select, DeleteModal, LocationModalShell,
} from "@/components/locations/LocationPrimitives";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Ward  { id: string; name: string; }
interface Lga   { id: string; name: string; wards: Ward[]; }
interface Zone  { id: string; name: string; lgas: Lga[]; }
interface State { id: string; name: string; zones: Zone[]; }

interface Pu {
    id: string;
    name: string;
    code: string | null;
    ward: Ward & { lga: Lga & { zone: Zone & { state: { id: string; name: string } } } };
    users_count: number;
    created_at: string;
}

interface PageProps {
    pus: { data: Pu[]; links: unknown[]; meta: Record<string, unknown> };
    states: State[];
    filters: { search?: string; ward_id?: string; state_id?: string };
    flash?: { status?: boolean; message?: string };
    [key: string]: unknown;
}

// ── PU Modal ──────────────────────────────────────────────────────────────────

function PuModal({
    open, onClose, pu, states,
}: {
    open: boolean;
    onClose: () => void;
    pu: Pu | null;
    states: State[];
}) {
    const isEdit = !!pu;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name:    "",
        code:    "",
        ward_id: "",
    });

    const [selStateId, setSelStateId] = useState("");
    const [selZoneId,  setSelZoneId]  = useState("");
    const [selLgaId,   setSelLgaId]   = useState("");

    const selState = states.find((s) => s.id === selStateId) ?? null;
    const selZone  = selState?.zones.find((z) => z.id === selZoneId) ?? null;
    const selLga   = selZone?.lgas.find((l) => l.id === selLgaId) ?? null;

    useEffect(() => {
        if (!open) return;
        clearErrors();
        if (pu) {
            setData({ name: pu.name, code: pu.code ?? "", ward_id: pu.ward?.id ?? "" });
            setSelStateId(pu.ward?.lga?.zone?.state?.id ?? "");
            setSelZoneId(pu.ward?.lga?.zone?.id ?? "");
            setSelLgaId(pu.ward?.lga?.id ?? "");
        } else {
            reset();
            setSelStateId(""); setSelZoneId(""); setSelLgaId("");
        }
    }, [open, pu?.id]);

    const handleStateChange = (id: string) => {
        setSelStateId(id); setSelZoneId(""); setSelLgaId(""); setData("ward_id", "");
    };
    const handleZoneChange = (id: string) => {
        setSelZoneId(id); setSelLgaId(""); setData("ward_id", "");
    };
    const handleLgaChange = (id: string) => {
        setSelLgaId(id); setData("ward_id", "");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => onClose(), onError: () => {} };
        isEdit
            ? put(`/admin/pus/${pu!.id}`, opts)
            : post(`/admin/pus`, opts);
    };

    return (
        <LocationModalShell
            open={open}
            onClose={onClose}
            title={isEdit ? "Edit Polling Unit" : "Add Polling Unit"}
            processing={processing}
            onSubmit={handleSubmit}
            isEdit={isEdit}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <Label>Polling Unit Name <span className="text-destructive">*</span></Label>
                    <Input
                        type="text"
                        placeholder="e.g. Primary School Fagge"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        error={errors.name}
                    />
                    <FieldError message={errors.name} />
                </div>

                <div className="sm:col-span-2">
                    <Label>PU Code <span className="text-[10px] text-muted-foreground">(optional)</span></Label>
                    <Input
                        type="text"
                        placeholder="e.g. KN/01/02/003"
                        value={data.code}
                        onChange={(e) => setData("code", e.target.value)}
                        error={errors.code}
                    />
                    <FieldError message={errors.code} />
                </div>

                <div>
                    <Label>State <span className="text-destructive">*</span></Label>
                    <Select value={selStateId} onChange={(e) => handleStateChange(e.target.value)}>
                        <option value="">Select state</option>
                        {states.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </Select>
                </div>

                <div>
                    <Label>Zone <span className="text-destructive">*</span></Label>
                    <Select
                        value={selZoneId}
                        onChange={(e) => handleZoneChange(e.target.value)}
                        disabled={!selStateId}
                    >
                        <option value="">Select zone</option>
                        {selState?.zones.map((z) => (
                            <option key={z.id} value={z.id}>{z.name}</option>
                        ))}
                    </Select>
                </div>

                <div>
                    <Label>LGA <span className="text-destructive">*</span></Label>
                    <Select
                        value={selLgaId}
                        onChange={(e) => handleLgaChange(e.target.value)}
                        disabled={!selZoneId}
                    >
                        <option value="">Select LGA</option>
                        {selZone?.lgas.map((l) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </Select>
                </div>

                <div>
                    <Label>Ward <span className="text-destructive">*</span></Label>
                    <Select
                        value={data.ward_id}
                        onChange={(e) => setData("ward_id", e.target.value)}
                        error={errors.ward_id}
                        disabled={!selLgaId}
                    >
                        <option value="">Select ward</option>
                        {selLga?.wards.map((w) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </Select>
                    <FieldError message={errors.ward_id} />
                </div>
            </div>
        </LocationModalShell>
    );
}

// ── Index Page ────────────────────────────────────────────────────────────────

export default function PusIndex() {
    const { props } = usePage<PageProps>();
    const { pus, states, filters, flash } = props;

    const [showModal, setShowModal] = useState(false);
    const [editPu,    setEditPu]    = useState<Pu | null>(null);
    const [deletePu,  setDeletePu]  = useState<Pu | null>(null);

    useEffect(() => {
        if (flash?.message) {
            flash.status ? toast.success(flash.message) : toast.error(flash.message);
        }
    }, [flash]);

    const openCreate = () => { setEditPu(null); setShowModal(true); };
    const openEdit   = (p: Pu) => { setEditPu(p); setShowModal(true); };

    const allWards = states.flatMap((s) =>
        s.zones.flatMap((z) => z.lgas.flatMap((l) => l.wards))
    );

    const columns = [
        {
            key: "name",
            label: "Polling Unit",
            accessor: (row: Pu) => (
                <div>
                    <span className="font-['Syne',sans-serif] font-semibold text-[13px] block">
                        {row.name}
                    </span>
                    {row.code && (
                        <span className="font-['DM_Mono',monospace] text-[10px] text-muted-foreground">
                            {row.code}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "ward",
            label: "Ward",
            accessor: (row: Pu) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">
                    {row.ward?.name ?? "—"}
                </span>
            ),
        },
        {
            key: "lga",
            label: "LGA",
            accessor: (row: Pu) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">
                    {row.ward?.lga?.name ?? "—"}
                </span>
            ),
        },
        {
            key: "state",
            label: "State",
            accessor: (row: Pu) => (
                <span className="inline-flex items-center px-2.5 py-[3px] rounded-full
                    font-['DM_Mono',monospace] text-[11px] font-medium capitalize whitespace-nowrap
                    text-primary bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]
                    border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                    {row.ward?.lga?.zone?.state?.name ?? "—"}
                </span>
            ),
        },
        {
            key: "users_count",
            label: "Users",
            accessor: (row: Pu) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">
                    {row.users_count}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Created",
            accessor: (row: Pu) => (
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
            <Head title="Manage Polling Units" />
            <AppLayout
                SideNavigation={AdminSidebar}
                title="Polling Units"
                sub="Create and manage polling units"
                live={false}
                actions={
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                            font-['Syne',sans-serif] bg-primary text-primary-foreground
                            transition-all hover:opacity-90"
                    >
                        <Plus size={15} />
                        Add Polling Unit
                    </button>
                }
            >
                <DataTable
                    data={pus}
                    columns={columns as any}
                    indexUrl="/admin/pus"
                    filters={filters as Record<string, string>}
                    filterConfigs={[
                        {
                            key: "ward_id",
                            label: "Ward",
                            value: filters.ward_id ?? "",
                            options: allWards.map((w) => ({ value: w.id, label: w.name })),
                        },
                    ]}
                    searchPlaceholder="Search polling units..."
                    noun="polling units"
                    reloadOnly={["pus"]}
                    emptyIcon={<CircleDot size={32} />}
                    emptyMessage="No polling units found"
                    renderActions={(row: Pu) => (
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
                                onClick={() => setDeletePu(row)}
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

                <PuModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    pu={editPu}
                    states={states}
                />

                <DeleteModal
                    open={!!deletePu}
                    onClose={() => setDeletePu(null)}
                    url={deletePu ? `/admin/pus/${deletePu.id}` : ""}
                    label="Polling Unit"
                    name={deletePu?.name ?? ""}
                />
            </AppLayout>
        </>
    );
}