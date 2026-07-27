import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { X, Loader } from "lucide-react";
import Portal from "@/components/Portal";
import bivas from "@/routes/admin/bivas";

interface Option { value: string; label: string; }
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

interface Machine {
    id: string;
    serial_number: string;
    status: string;
    pu_id: string;
}

interface Props {
    open:          boolean;
    onClose:       () => void;
    locations:     LocationNode[];
    locationScope: LocationScope;
    statuses:      Option[];
    machine?:      Machine | null;
}

const LEVEL_CHAINS: Record<LocationScope, { key: string; label: string; childKey: string }[]> = {
    state: [
        { key: "state", label: "State", childKey: "zones" },
        { key: "zone",  label: "Zone",  childKey: "lgas"  },
        { key: "lga",   label: "LGA",   childKey: "wards" },
        { key: "ward",  label: "Ward",  childKey: "pus"   },
    ],
    zone: [
        { key: "zone", label: "Zone", childKey: "lgas"  },
        { key: "lga",  label: "LGA",  childKey: "wards" },
        { key: "ward", label: "Ward", childKey: "pus"   },
    ],
    lga: [
        { key: "lga",  label: "LGA",  childKey: "wards" },
        { key: "ward", label: "Ward", childKey: "pus"   },
    ],
    ward: [
        { key: "ward", label: "Ward", childKey: "pus" },
    ],
};

function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="block mb-1.5 font-['DM_Mono',monospace] text-[12px] text-muted-foreground">
            {children}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 font-['DM_Mono',monospace] text-[11px] text-destructive">{message}</p>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <p className="mb-3 pb-1.5 border-b border-border font-['Syne',sans-serif] text-[12px] font-bold
            uppercase tracking-[0.08em] text-muted-foreground">
            {children}
        </p>
    );
}

const fieldCls = (error?: string) =>
    `w-full px-3 py-[8px] rounded-lg text-[13px] font-['DM_Mono',monospace]
     text-foreground bg-background outline-none transition-colors
     border ${error ? "border-destructive" : "border-border"} focus:border-primary`;

const selectCls = (error?: string) =>
    `${fieldCls(error)} appearance-none cursor-pointer pr-8
     bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")]
     bg-no-repeat bg-[right_12px_center]`;

export default function BivasModal({ open, onClose, locations, locationScope, statuses, machine }: Props) {
    const isEdit = !!machine;
    const chain = LEVEL_CHAINS[locationScope];

    const [selected, setSelected] = useState<(LocationNode | null)[]>(() => chain.map(() => null));

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        serial_number: machine?.serial_number ?? "",
        status:        machine?.status        ?? "active",
        pu_id:         machine?.pu_id         ?? "",
    });

    useEffect(() => {
        if (!open) return;
        clearErrors();

        const initial = chain.map(() => null as LocationNode | null);
        if (locations.length === 1) initial[0] = locations[0];
        setSelected(initial);

        if (machine) {
            setData({ serial_number: machine.serial_number, status: machine.status, pu_id: machine.pu_id });
        } else {
            reset();
            setData("status", "active");
        }
    }, [open, machine?.id]);

    const handleSelect = (levelIndex: number, node: LocationNode | null) => {
        setSelected(prev => {
            const next = [...prev];
            next[levelIndex] = node;
            for (let i = levelIndex + 1; i < next.length; i++) next[i] = null;
            return next;
        });
        setData("pu_id", "");
    };

    const optionsForLevel = (levelIndex: number): LocationNode[] => {
        if (levelIndex === 0) return locations;
        const parent = selected[levelIndex - 1];
        if (!parent) return [];
        const key = chain[levelIndex - 1].childKey;
        return (parent[key] as LocationNode[] | undefined) ?? [];
    };

    const lastSelected = selected[chain.length - 1];
    const puOptions: PuOption[] = lastSelected ? (lastSelected.pus ?? []) : [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => onClose(), preserveScroll: true };
        isEdit
            ? post(bivas.update.url(machine!.id, { query: { _method: "PUT" } }), opts)
            : post(bivas.store().url, opts);
    };

    if (!open) return null;

    return (
        <Portal>
            <div className="animate-fade-in fixed inset-0 z-[200] flex items-start justify-center px-4 py-6 overflow-y-auto
                    bg-black/50"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className="animate-slide-up bg-card dark:bg-[#0f1117] border border-border rounded-2xl w-full max-w-[600px]
                    shadow-[0_24px_60px_rgba(0,0,0,0.2)] my-auto">

                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
                        <h2 className="font-['Syne',sans-serif] text-[17px] font-bold text-foreground">
                            {isEdit ? "Edit BIVAS Machine" : "Register BIVAS Machine"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

                        {errors.general && (
                            <div className="px-3 py-2.5 rounded-lg text-[12px] font-['DM_Mono',monospace]
                                bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)]
                                border border-[color-mix(in_oklch,var(--destructive)_30%,transparent)] text-destructive">
                                {errors.general}
                            </div>
                        )}

                        <div>
                            <SectionTitle>Machine Details</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <div className="sm:col-span-2">
                                    <Label>Serial Number <span className="text-destructive">*</span></Label>
                                    <input
                                        className={fieldCls(errors.serial_number)}
                                        placeholder="BVS-2026-004821"
                                        value={data.serial_number}
                                        onChange={e => setData("serial_number", e.target.value)}
                                    />
                                    <FieldError message={errors.serial_number} />
                                </div>

                                <div className="sm:col-span-2">
                                    <Label>Status <span className="text-destructive">*</span></Label>
                                    <select
                                        className={selectCls(errors.status)}
                                        value={data.status}
                                        onChange={e => setData("status", e.target.value)}
                                    >
                                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                    <FieldError message={errors.status} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <SectionTitle>Assigned Polling Unit</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {chain.map((level, idx) => {
                                    if (idx > 0 && !selected[idx - 1]) return null;
                                    const opts = optionsForLevel(idx);

                                    return (
                                        <select
                                            key={level.key}
                                            className={selectCls()}
                                            value={selected[idx]?.id ?? ""}
                                            onChange={e => handleSelect(idx, opts.find(o => o.id === e.target.value) ?? null)}
                                        >
                                            <option value="">Select {level.label.toLowerCase()}</option>
                                            {opts.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                        </select>
                                    );
                                })}

                                {lastSelected && (
                                    <div className="sm:col-span-2">
                                        <Label>Polling Unit <span className="text-destructive">*</span></Label>
                                        <select
                                            className={selectCls(errors.pu_id)}
                                            value={data.pu_id}
                                            onChange={e => setData("pu_id", e.target.value)}
                                        >
                                            <option value="">Select polling unit</option>
                                            {puOptions.map(p => (
                                                <option key={p.id} value={p.id}>{p.code ? `${p.code} - ${p.name}` : p.name}</option>
                                            ))}
                                        </select>
                                        <FieldError message={errors.pu_id} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-[9px] rounded-lg text-[13px] font-['Syne',sans-serif] font-semibold
                                    border border-border bg-transparent text-foreground cursor-pointer hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-1.5 px-5 py-[9px] rounded-lg text-[13px]
                                    font-['Syne',sans-serif] font-semibold bg-primary text-primary-foreground
                                    border-none cursor-pointer disabled:opacity-60 transition-opacity"
                            >
                                {processing && <Loader size={14} className="animate-spin" />}
                                {isEdit ? "Save Changes" : "Register Machine"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}