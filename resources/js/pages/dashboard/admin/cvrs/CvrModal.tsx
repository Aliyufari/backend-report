import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { X, Loader } from "lucide-react";
import Portal from "@/components/Portal";
import cvrs from "@/routes/cvrs";
import { State, Zone, Lga, Ward, Cvr } from "@/types";

interface Option { value: string; label: string; }

interface Props {
    open:     boolean;
    onClose:  () => void;
    state:    State[];
    types:    Option[];
    statuses: Option[];
    cvr?:     Cvr | null;
}

// ── Reusable primitives ───────────────────────────────────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

export default function CvrModal({ open, onClose, state, types, statuses, cvr }: Props) {
    const isEdit = !!cvr;

    const [selState, setSelState] = useState<State | null>(null);
    const [selZone,  setSelZone]  = useState<Zone  | null>(null);
    const [selLga,   setSelLga]   = useState<Lga   | null>(null);
    const [selWard,  setSelWard]  = useState<Ward  | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        unique_id: cvr?.unique_id ?? "",
        type:      cvr?.type      ?? "",
        status:    cvr?.status    ?? "",
        pu_id:     cvr?.pu_id     ?? "",
    });

    useEffect(() => {
        if (!open) return;
        clearErrors();
        setSelState(null); setSelZone(null); setSelLga(null); setSelWard(null);

        if (cvr) {
            setData({ unique_id: cvr.unique_id, type: cvr.type, status: cvr.status, pu_id: cvr.pu_id });
        } else {
            reset();
        }
    }, [open, cvr?.id]);

    const resetBelow = (level: "state" | "zone" | "lga" | "ward") => {
        if (level === "state") { setSelZone(null); setSelLga(null); setSelWard(null); }
        if (level === "zone")  { setSelLga(null);  setSelWard(null); }
        if (level === "lga")   { setSelWard(null); }
        setData("pu_id", "");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => onClose(), onError: () => {} };
        isEdit
            ? post(cvrs.update.url(cvr!.id, { query: { _method: "PUT" } }), opts)
            : post(cvrs.store().url, opts);
    };

    if (!open) return null;

    return (
        <Portal>
            {/* Overlay */}
            <div className="animate-fade-in fixed inset-0 z-[200] flex items-start justify-center px-4 py-6 overflow-y-auto
                    bg-black/50"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                {/* Box */}
                <div className="animate-slide-up bg-card dark:bg-[#0f1117] border border-border rounded-2xl w-full max-w-[600px]
                    shadow-[0_24px_60px_rgba(0,0,0,0.2)] my-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
                        <h2 className="font-['Syne',sans-serif] text-[17px] font-bold text-foreground">
                            {isEdit ? "Edit CVR Record" : "New CVR Record"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

                        {/* CVR Details */}
                        <div>
                            <SectionTitle>CVR Details</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <div className="sm:col-span-2">
                                    <Label>Unique ID <span className="text-destructive">*</span></Label>
                                    <input
                                        className={fieldCls(errors.unique_id)}
                                        placeholder="PRE8534820"
                                        value={data.unique_id}
                                        onChange={e => setData("unique_id", e.target.value)}
                                    />
                                    <FieldError message={errors.unique_id} />
                                </div>

                                <div>
                                    <Label>Type <span className="text-destructive">*</span></Label>
                                    <select
                                        className={selectCls(errors.type)}
                                        value={data.type}
                                        onChange={e => setData("type", e.target.value)}
                                    >
                                        <option value="">Select type</option>
                                        {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                    <FieldError message={errors.type} />
                                </div>

                                {isEdit && (
                                    <div>
                                        <Label>Status <span className="text-destructive">*</span></Label>
                                        <select
                                            className={selectCls(errors.status)}
                                            value={data.status}
                                            onChange={e => setData("status", e.target.value)}
                                        >
                                            <option value="">Select status</option>
                                            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                        <FieldError message={errors.status} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Polling Unit */}
                        <div>
                            <SectionTitle>Polling Unit</SectionTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <select
                                    className={selectCls()}
                                    onChange={e => {
                                        setSelState(state.find(x => x.id === e.target.value) ?? null);
                                        resetBelow("state");
                                    }}
                                >
                                    <option value="">Select state</option>
                                    {state.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>

                                {selState && (
                                    <select
                                        className={selectCls()}
                                        onChange={e => {
                                            setSelZone(selState.zones.find(x => x.id === e.target.value) ?? null);
                                            resetBelow("zone");
                                        }}
                                    >
                                        <option value="">Select zone</option>
                                        {selState.zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                    </select>
                                )}

                                {selZone && (
                                    <select
                                        className={selectCls()}
                                        onChange={e => {
                                            setSelLga(selZone.lgas.find(x => x.id === e.target.value) ?? null);
                                            resetBelow("lga");
                                        }}
                                    >
                                        <option value="">Select LGA</option>
                                        {selZone.lgas.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                )}

                                {selLga && (
                                    <select
                                        className={selectCls()}
                                        onChange={e => {
                                            setSelWard(selLga.wards.find(x => x.id === e.target.value) ?? null);
                                            resetBelow("ward");
                                        }}
                                    >
                                        <option value="">Select ward</option>
                                        {selLga.wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                )}

                                {selWard && (
                                    <div className="sm:col-span-2">
                                        <Label>Polling Unit <span className="text-destructive">*</span></Label>
                                        <select
                                            className={selectCls(errors.pu_id)}
                                            value={data.pu_id}
                                            onChange={e => setData("pu_id", e.target.value)}
                                        >
                                            <option value="">Select polling unit</option>
                                            {selWard.pus.map(p => (
                                                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                            ))}
                                        </select>
                                        <FieldError message={errors.pu_id} />
                                    </div>
                                )}
                            </div>
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
                                {isEdit ? "Save Changes" : "Create Record"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}