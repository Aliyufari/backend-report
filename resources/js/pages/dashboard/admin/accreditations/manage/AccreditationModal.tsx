import { useEffect, useState, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { X, Loader, Upload } from "lucide-react";
import Portal from "@/components/Portal";
import accreditationRoutes from "@/routes/admin/manage-accreditation";

// ─── Enum Types & Maps ────────────────────────────────────────────────────────

export enum ElectionType {
    GENERAL = 'general',
    PRESIDENTIAL = 'presidential',
    GUBERNATORIAL = 'gubernatorial',
    NATIONAL_ASSEMBLY = 'national_assembly',
    STATE_ASSEMBLY = 'state_assembly',
    LOCAL_GOVERNMENT = 'local_government',
    BYE_ELECTION = 'bye_election',
    REFERENDUM = 'referendum',
}

export const ELECTION_TYPE_LABELS: Record<ElectionType | string, string> = {
    [ElectionType.GENERAL]: 'General Election',
    [ElectionType.PRESIDENTIAL]: 'Presidential',
    [ElectionType.GUBERNATORIAL]: 'Gubernatorial',
    [ElectionType.NATIONAL_ASSEMBLY]: 'National Assembly',
    [ElectionType.STATE_ASSEMBLY]: 'State Assembly',
    [ElectionType.LOCAL_GOVERNMENT]: 'Local Government',
    [ElectionType.BYE_ELECTION]: 'Bye-Election',
    [ElectionType.REFERENDUM]: 'Referendum',
};

interface Option { value: string; label: string; }
interface ElectionOption { 
    id: string; 
    title: string; 
    type?: ElectionType;
}
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

interface Accreditation {
    id: string;
    election_id: string;
    pu_id: string;
    accredited_voters: number;
    status: string;
    image_path: string | null;
}

interface Props {
    open: boolean;
    onClose: () => void;
    elections: ElectionOption[];
    locations: LocationNode[];
    locationScope: LocationScope;
    statuses: Option[];
    accreditation?: Accreditation | null;
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
        <p className="mb-3 pb-1.5 border-b border-border font-['Syne',sans-serif] text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
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

export default function AccreditationModal({
    open,
    onClose,
    elections,
    locations,
    locationScope,
    statuses,
    accreditation,
}: Props) {
    const isEdit = !!accreditation;
    const chain = LEVEL_CHAINS[locationScope];
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selected, setSelected] = useState<(LocationNode | null)[]>(() => chain.map(() => null));
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        election_id: string;
        pu_id: string;
        accredited_voters: string | number;
        status: string;
        image: File | null;
    }>({
        election_id: accreditation?.election_id ?? "",
        pu_id: accreditation?.pu_id ?? "",
        accredited_voters: accreditation?.accredited_voters ?? "",
        status: accreditation?.status ?? "pending",
        image: null,
    });

    useEffect(() => {
        if (!open) return;
        clearErrors();

        const initial = chain.map(() => null as LocationNode | null);
        if (locations.length === 1) initial[0] = locations[0];
        setSelected(initial);

        if (accreditation) {
            setData({
                election_id: accreditation.election_id,
                pu_id: accreditation.pu_id,
                accredited_voters: accreditation.accredited_voters,
                status: accreditation.status,
                image: null,
            });
            setImagePreview(accreditation.image_path ? `/storage/${accreditation.image_path}` : null);
        } else {
            reset();
            setData("status", "pending");
            setImagePreview(null);
        }
    }, [open, accreditation?.id]);

    const handleSelect = (levelIndex: number, node: LocationNode | null) => {
        setSelected((prev) => {
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("image", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const lastSelected = selected[chain.length - 1];
    const puOptions: PuOption[] = lastSelected ? lastSelected.pus ?? [] : [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => onClose(), preserveScroll: true };

        if (isEdit) {
            post(accreditationRoutes.update.url(accreditation!.id, { query: { _method: "PUT" } }), opts);
        } else {
            post(accreditationRoutes.store().url, opts);
        }
    };

    if (!open) return null;

    return (
        <Portal>
            <div
                className="animate-fade-in fixed inset-0 z-[200] flex items-start justify-center px-4 py-6 overflow-y-auto bg-black/50"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <div className="animate-slide-up bg-card dark:bg-[#0f1117] border border-border rounded-2xl w-full max-w-[600px] shadow-[0_24px_60px_rgba(0,0,0,0.2)] my-auto">
                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
                        <h2 className="font-['Syne',sans-serif] text-[17px] font-bold text-foreground">
                            {isEdit ? "Edit Accreditation Record" : "Add Accreditation Record"}
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
                            <div className="px-3 py-2.5 rounded-lg text-[12px] font-['DM_Mono',monospace] bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)] border border-[color-mix(in_oklch,var(--destructive)_30%,transparent)] text-destructive">
                                {errors.general}
                            </div>
                        )}

                        {/* Election & Details */}
                        <div>
                            <SectionTitle>Record Details</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <Label>Election <span className="text-destructive">*</span></Label>
                                    <select
                                        className={selectCls(errors.election_id)}
                                        value={data.election_id}
                                        onChange={(e) => setData("election_id", e.target.value)}
                                    >
                                        <option value="">Select election</option>
                                        {elections.map((e) => {
                                            const typeLabel = e.type ? ELECTION_TYPE_LABELS[e.type] ?? e.type : null;
                                            return (
                                                <option key={e.id} value={e.id}>
                                                    {e.title} {typeLabel ? `(${typeLabel})` : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <FieldError message={errors.election_id} />
                                </div>

                                <div>
                                    <Label>Accredited Voters <span className="text-destructive">*</span></Label>
                                    <input
                                        type="number"
                                        min="0"
                                        className={fieldCls(errors.accredited_voters)}
                                        placeholder="0"
                                        value={data.accredited_voters}
                                        onChange={(e) => setData("accredited_voters", e.target.value)}
                                    />
                                    <FieldError message={errors.accredited_voters} />
                                </div>

                                <div>
                                    <Label>Status <span className="text-destructive">*</span></Label>
                                    <select
                                        className={selectCls(errors.status)}
                                        value={data.status}
                                        onChange={(e) => setData("status", e.target.value)}
                                    >
                                        {statuses.map((s) => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                    <FieldError message={errors.status} />
                                </div>
                            </div>
                        </div>

                        {/* Polling Unit Hierarchy */}
                        <div>
                            <SectionTitle>Location Mapping</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {chain.map((level, idx) => {
                                    if (idx > 0 && !selected[idx - 1]) return null;
                                    const opts = optionsForLevel(idx);

                                    return (
                                        <div key={level.key}>
                                            <Label>{level.label}</Label>
                                            <select
                                                className={selectCls()}
                                                value={selected[idx]?.id ?? ""}
                                                onChange={(e) =>
                                                    handleSelect(idx, opts.find((o) => o.id === e.target.value) ?? null)
                                                }
                                            >
                                                <option value="">Select {level.label.toLowerCase()}</option>
                                                {opts.map((o) => (
                                                    <option key={o.id} value={o.id}>{o.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                })}

                                {lastSelected && (
                                    <div className="sm:col-span-2">
                                        <Label>Polling Unit <span className="text-destructive">*</span></Label>
                                        <select
                                            className={selectCls(errors.pu_id)}
                                            value={data.pu_id}
                                            onChange={(e) => setData("pu_id", e.target.value)}
                                        >
                                            <option value="">Select polling unit</option>
                                            {puOptions.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.code ? `${p.code} - ${p.name}` : p.name}
                                                </option>
                                            ))}
                                        </select>
                                        <FieldError message={errors.pu_id} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Evidence Upload */}
                        <div>
                            <SectionTitle>Accreditation Evidence</SectionTitle>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            
                            <div className="flex items-center gap-4">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors bg-muted/30"
                                >
                                    <Upload size={20} className="text-muted-foreground mb-1" />
                                    <span className="text-xs font-['DM_Mono',monospace] text-muted-foreground">
                                        {data.image ? data.image.name : "Click to select result sheet photo"}
                                    </span>
                                </div>

                                {imagePreview && (
                                    <div className="relative w-16 h-16 rounded-lg border border-border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <FieldError message={errors.image} />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-[9px] rounded-lg text-[13px] font-['Syne',sans-serif] font-semibold border border-border bg-transparent text-foreground cursor-pointer hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-1.5 px-5 py-[9px] rounded-lg text-[13px] font-['Syne',sans-serif] font-semibold bg-primary text-primary-foreground border-none cursor-pointer disabled:opacity-60 transition-opacity"
                            >
                                {processing && <Loader size={14} className="animate-spin" />}
                                {isEdit ? "Save Changes" : "Save Record"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}