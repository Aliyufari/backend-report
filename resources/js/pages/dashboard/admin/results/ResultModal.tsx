import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { X, Loader, Plus, Trash2 } from "lucide-react";
import Portal from "@/components/Portal";
import { store, update } from "@/routes/admin/manage-results";

interface Option { value: string; label: string; }
interface PuOption { id: string; code?: string; name: string; }
interface ElectionOption { id: string; title: string; }

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

interface Result {
    id: string;
    election_id: string;
    pu_id: string;
    total_votes: number;
    party_votes: Record<string, number> | null;
    status: string;
    image_path: string | null;
}

interface Props {
    open:          boolean;
    onClose:       () => void;
    elections:     ElectionOption[];
    locations:     LocationNode[];
    locationScope: LocationScope;
    statuses:      Option[];
    parties:       Option[];
    result?:       Result | null;
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
    return <label className="block mb-1.5 font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{children}</label>;
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

interface PartyRow { id: string; party: string; votes: string; }

function makeRowId() {
    return Math.random().toString(36).slice(2, 9);
}

export default function ResultModal({ open, onClose, elections, locations, locationScope, statuses, parties, result }: Props) {
    const isEdit = !!result;
    const chain = LEVEL_CHAINS[locationScope];

    const [selected, setSelected] = useState<(LocationNode | null)[]>(() => chain.map(() => null));
    const [partyRows, setPartyRows] = useState<PartyRow[]>([{ id: makeRowId(), party: "", votes: "" }]);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        election_id:  result?.election_id ?? "",
        pu_id:        result?.pu_id       ?? "",
        total_votes:  result?.total_votes?.toString() ?? "",
        party_votes:  result?.party_votes ?? ({} as Record<string, number>),
        status:       result?.status      ?? "pending",
        image:        null as File | null,
    });

    useEffect(() => {
        if (!open) return;
        clearErrors();

        const initial = chain.map(() => null as LocationNode | null);
        if (locations.length === 1) initial[0] = locations[0];
        setSelected(initial);

        if (result) {
            setData({
                election_id:  result.election_id,
                pu_id:        result.pu_id,
                total_votes:  result.total_votes.toString(),
                party_votes:  result.party_votes ?? {},
                status:       result.status,
                image:        null,
            });

            const entries = Object.entries(result.party_votes ?? {});
            setPartyRows(
                entries.length > 0
                    ? entries.map(([party, votes]) => ({ id: makeRowId(), party, votes: String(votes) }))
                    : [{ id: makeRowId(), party: "", votes: "" }]
            );
        } else {
            reset();
            setData("status", "pending");
            setPartyRows([{ id: makeRowId(), party: "", votes: "" }]);
        }
    }, [open, result?.id]);

    // ── Location cascade ──────────────────────────────────────────────────────

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

    // ── Party votes rows ──────────────────────────────────────────────────────

    const syncPartyVotes = (rows: PartyRow[]) => {
        const map: Record<string, number> = {};
        rows.forEach(r => {
            if (r.party.trim() && r.votes !== "") {
                map[r.party.trim()] = Number(r.votes) || 0;
            }
        });
        setData("party_votes", map);
    };

    const updateRow = (id: string, field: "party" | "votes", value: string) => {
        setPartyRows(prev => {
            const next = prev.map(r => r.id === id ? { ...r, [field]: value } : r);
            syncPartyVotes(next);
            return next;
        });
    };

    const addRow = () => setPartyRows(prev => [...prev, { id: makeRowId(), party: "", votes: "" }]);

    const removeRow = (id: string) => {
        setPartyRows(prev => {
            const next = prev.filter(r => r.id !== id);
            const rows = next.length > 0 ? next : [{ id: makeRowId(), party: "", votes: "" }];
            syncPartyVotes(rows);
            return rows;
        });
    };

    const partyVotesSum = Object.values(data.party_votes ?? {}).reduce((sum, v) => sum + (Number(v) || 0), 0);

    // ── Image ────────────────────────────────────────────────────────────────

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setData("image", file);
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { forceFormData: true, onSuccess: () => onClose(), preserveScroll: true };
        isEdit
            ? post(update.url(result!.id, { query: { _method: "PUT" } }), opts)
            : post(store().url, opts);
    };

    if (!open) return null;

    return (
        <Portal>
            <div
                className="animate-fade-in fixed inset-0 z-[200] flex items-start justify-center px-4 py-6 overflow-y-auto bg-black/50"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className="animate-slide-up bg-card dark:bg-[#0f1117] border border-border rounded-2xl w-full max-w-[640px]
                    shadow-[0_24px_60px_rgba(0,0,0,0.2)] my-auto">

                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
                        <h2 className="font-['Syne',sans-serif] text-[17px] font-bold text-foreground">
                            {isEdit ? "Edit Result" : "New Result"}
                        </h2>
                        <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
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

                        {/* Election + Status */}
                        <div>
                            <SectionTitle>Result Details</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>Election <span className="text-destructive">*</span></Label>
                                    <select
                                        className={selectCls(errors.election_id)}
                                        value={data.election_id}
                                        onChange={e => setData("election_id", e.target.value)}
                                    >
                                        <option value="">Select election</option>
                                        {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                                    </select>
                                    <FieldError message={errors.election_id} />
                                </div>

                                <div>
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

                                <div className="sm:col-span-2">
                                    <Label>Total Votes <span className="text-destructive">*</span></Label>
                                    <input
                                        type="number"
                                        min={0}
                                        className={fieldCls(errors.total_votes)}
                                        placeholder="0"
                                        value={data.total_votes}
                                        onChange={e => setData("total_votes", e.target.value)}
                                    />
                                    <FieldError message={errors.total_votes} />
                                </div>
                            </div>
                        </div>

                        {/* Party votes */}
                        <div>
                            <SectionTitle>Party Votes (optional)</SectionTitle>
                            <div className="space-y-2">
                                {partyRows.map(row => {
                                    const takenElsewhere = partyRows
                                        .filter(r => r.id !== row.id)
                                        .map(r => r.party);

                                    return (
                                        <div key={row.id} className="flex items-center gap-2">
                                            <select
                                                className={selectCls()}
                                                value={row.party}
                                                onChange={e => updateRow(row.id, "party", e.target.value)}
                                            >
                                                <option value="">Select party</option>
                                                {parties.map(p => (
                                                    <option key={p.value} value={p.value} disabled={takenElsewhere.includes(p.value)}>
                                                        {p.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min={0}
                                                className={fieldCls()}
                                                placeholder="Votes"
                                                value={row.votes}
                                                onChange={e => updateRow(row.id, "votes", e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeRow(row.id)}
                                                className="flex-shrink-0 w-8 h-8 rounded-lg border border-border flex items-center justify-center
                                                    text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    );
                                })}

                                <button
                                    type="button"
                                    onClick={addRow}
                                    className="flex items-center gap-1.5 text-[12px] font-['Syne',sans-serif] font-semibold text-primary bg-transparent border-none cursor-pointer"
                                >
                                    <Plus size={14} /> Add party
                                </button>

                                <FieldError message={errors.party_votes} />

                                {partyVotesSum > 0 && (
                                    <p className="text-[11px] font-['DM_Mono',monospace] text-muted-foreground">
                                        Party votes sum: {partyVotesSum.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Polling Unit */}
                        <div>
                            <SectionTitle>Polling Unit</SectionTitle>
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

                        {/* Image */}
                        <div>
                            <SectionTitle>Result Sheet Image</SectionTitle>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full text-[12px] font-['DM_Mono',monospace] text-muted-foreground
                                    file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0
                                    file:bg-primary file:text-primary-foreground file:text-[12px] file:font-semibold
                                    file:cursor-pointer cursor-pointer"
                            />
                            {isEdit && result?.image_path && !data.image && (
                                <p className="mt-1.5 text-[11px] font-['DM_Mono',monospace] text-muted-foreground">
                                    An image is already uploaded. Choose a new file to replace it.
                                </p>
                            )}
                            <FieldError message={errors.image} />
                        </div>

                        {/* Footer */}
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
                                {isEdit ? "Save Changes" : "Create Result"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}