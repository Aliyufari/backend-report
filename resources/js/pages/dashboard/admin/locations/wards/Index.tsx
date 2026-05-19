import { useState, useEffect } from "react";
import { usePage, Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import { LayoutGrid, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import DataTable from "@/components/ui/DataTable";
import {
    Label, FieldError, Input, Select, DeleteModal, LocationModalShell,
} from "@/components/locations/LocationPrimitives";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Lga   { id: string; name: string; }
interface Zone  { id: string; name: string; lgas: Lga[]; }
interface State { id: string; name: string; zones: Zone[]; }

interface Ward {
    id: string;
    name: string;
    lga: Lga & { zone: Zone & { state: { id: string; name: string } } };
    pus_count: number;
    users_count: number;
    created_at: string;
}

interface PageProps {
    wards: { data: Ward[]; links: unknown[]; meta: Record<string, unknown> };
    states: State[];
    filters: { search?: string; lga_id?: string; state_id?: string };
    flash?: { status?: boolean; message?: string };
    [key: string]: unknown;
}

// ── Ward Modal ────────────────────────────────────────────────────────────────

function WardModal({
    open, onClose, ward, states,
}: {
    open: boolean;
    onClose: () => void;
    ward: Ward | null;
    states: State[];
}) {
    const isEdit = !!ward;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name:   "",
        lga_id: "",
    });

    const [selStateId, setSelStateId] = useState("");
    const [selZoneId,  setSelZoneId]  = useState("");

    const selState = states.find((s) => s.id === selStateId) ?? null;
    const selZone  = selState?.zones.find((z) => z.id === selZoneId) ?? null;

    useEffect(() => {
        if (!open) return;
        clearErrors();
        if (ward) {
            setData({ name: ward.name, lga_id: ward.lga?.id ?? "" });
            setSelStateId(ward.lga?.zone?.state?.id ?? "");
            setSelZoneId(ward.lga?.zone?.id ?? "");
        } else {
            reset();
            setSelStateId(""); setSelZoneId("");
        }
    }, [open, ward?.id]);

    const handleStateChange = (id: string) => {
        setSelStateId(id); setSelZoneId(""); setData("lga_id", "");
    };
    const handleZoneChange = (id: string) => {
        setSelZoneId(id); setData("lga_id", "");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => onClose(), onError: () => {} };
        isEdit
            ? put(`/admin/wards/${ward!.id}`, opts)
            : post(`/admin/wards`, opts);
    };

    return (
        <LocationModalShell
            open={open}
            onClose={onClose}
            title={isEdit ? "Edit Ward" : "Add Ward"}
            processing={processing}
            onSubmit={handleSubmit}
            isEdit={isEdit}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <Label>Ward Name <span className="text-destructive">*</span></Label>
                    <Input
                        type="text"
                        placeholder="e.g. Fagge A"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        error={errors.name}
                    />
                    <FieldError message={errors.name} />
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

                <div className="sm:col-span-2">
                    <Label>LGA <span className="text-destructive">*</span></Label>
                    <Select
                        value={data.lga_id}
                        onChange={(e) => setData("lga_id", e.target.value)}
                        error={errors.lga_id}
                        disabled={!selZoneId}
                    >
                        <option value="">Select LGA</option>
                        {selZone?.lgas.map((l) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </Select>
                    <FieldError message={errors.lga_id} />
                </div>
            </div>
        </LocationModalShell>
    );
}

// ── Index Page ────────────────────────────────────────────────────────────────

export default function WardsIndex() {
    const { props } = usePage<PageProps>();
    const { wards, states, filters, flash } = props;

    const [showModal,  setShowModal]  = useState(false);
    const [editWard,   setEditWard]   = useState<Ward | null>(null);
    const [deleteWard, setDeleteWard] = useState<Ward | null>(null);

    useEffect(() => {
        if (flash?.message) {
            flash.status ? toast.success(flash.message) : toast.error(flash.message);
        }
    }, [flash]);

    const openCreate = () => { setEditWard(null); setShowModal(true); };
    const openEdit   = (w: Ward) => { setEditWard(w); setShowModal(true); };

    const allLgas = states.flatMap((s) => s.zones.flatMap((z) => z.lgas));

    const columns = [
        {
            key: "name",
            label: "Ward",
            accessor: (row: Ward) => (
                <span className="font-['Syne',sans-serif] font-semibold text-[13px]">{row.name}</span>
            ),
        },
        {
            key: "lga",
            label: "LGA",
            accessor: (row: Ward) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">
                    {row.lga?.name ?? "—"}
                </span>
            ),
        },
        {
            key: "state",
            label: "State",
            accessor: (row: Ward) => (
                <span className="inline-flex items-center px-2.5 py-[3px] rounded-full
                    font-['DM_Mono',monospace] text-[11px] font-medium capitalize whitespace-nowrap
                    text-primary bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]
                    border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                    {row.lga?.zone?.state?.name ?? "—"}
                </span>
            ),
        },
        {
            key: "pus_count",
            label: "Polling Units",
            accessor: (row: Ward) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">
                    {row.pus_count}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Created",
            accessor: (row: Ward) => (
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
            <Head title="Manage Wards" />
            <AppLayout
                SideNavigation={AdminSidebar}
                title="Manage Wards"
                sub="Create and manage electoral wards"
                live={false}
                actions={
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                            font-['Syne',sans-serif] bg-primary text-primary-foreground
                            transition-all hover:opacity-90"
                    >
                        <Plus size={15} />
                        Add Ward
                    </button>
                }
            >
                <DataTable
                    data={wards}
                    columns={columns as any}
                    indexUrl="/admin/wards"
                    filters={filters as Record<string, string>}
                    filterConfigs={[
                        {
                            key: "lga_id",
                            label: "LGA",
                            value: filters.lga_id ?? "",
                            options: allLgas.map((l) => ({ value: l.id, label: l.name })),
                        },
                    ]}
                    searchPlaceholder="Search wards..."
                    noun="wards"
                    reloadOnly={["wards"]}
                    emptyIcon={<LayoutGrid size={32} />}
                    emptyMessage="No wards found"
                    renderActions={(row: Ward) => (
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
                                onClick={() => setDeleteWard(row)}
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

                <WardModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    ward={editWard}
                    states={states}
                />

                <DeleteModal
                    open={!!deleteWard}
                    onClose={() => setDeleteWard(null)}
                    url={deleteWard ? `/admin/wards/${deleteWard.id}` : ""}
                    label="Ward"
                    name={deleteWard?.name ?? ""}
                />
            </AppLayout>
        </>
    );
}