import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { X, Loader } from "lucide-react";
import Portal from "@/components/Portal";
import { store, update } from "@/routes/admin/elections";

interface Option { value: string; label: string; }

interface Election {
    id: string;
    title: string;
    type: string | null;
    election_date: string | null;
    status: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    statuses: Option[];
    types: Option[];
    election?: Election | null;
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="block mb-1.5 font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{children}</label>;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 font-['DM_Mono',monospace] text-[11px] text-destructive">{message}</p>;
}

const fieldCls = (error?: string) =>
    `w-full px-3 py-[8px] rounded-lg text-[13px] font-['DM_Mono',monospace]
     text-foreground bg-background outline-none transition-colors
     border ${error ? "border-destructive" : "border-border"} focus:border-primary`;

const selectCls = (error?: string) =>
    `${fieldCls(error)} appearance-none cursor-pointer pr-8
     bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")]
     bg-no-repeat bg-[right_12px_center]`;

export default function ElectionModal({ open, onClose, statuses, types, election }: Props) {
    const isEdit = !!election;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        title:         election?.title         ?? "",
        type:          election?.type          ?? "",
        election_date: election?.election_date ?? "",
        status:        election?.status        ?? "upcoming",
    });

    useEffect(() => {
        if (!open) return;
        clearErrors();

        if (election) {
            setData({
                title:         election.title,
                type:          election.type ?? "",
                election_date: election.election_date ?? "",
                status:        election.status,
            });
        } else {
            reset();
            setData("status", "upcoming");
        }
    }, [open, election?.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => onClose(), preserveScroll: true };
        isEdit
            ? post(update.url(election!.id, { query: { _method: "PUT" } }), opts)
            : post(store().url, opts);
    };

    if (!open) return null;

    return (
        <Portal>
            <div
                className="animate-fade-in fixed inset-0 z-[200] flex items-start justify-center px-4 py-6 overflow-y-auto bg-black/50"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className="animate-slide-up bg-card dark:bg-[#0f1117] border border-border rounded-2xl w-full max-w-[520px]
                    shadow-[0_24px_60px_rgba(0,0,0,0.2)] my-auto">

                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
                        <h2 className="font-['Syne',sans-serif] text-[17px] font-bold text-foreground">
                            {isEdit ? "Edit Election" : "New Election"}
                        </h2>
                        <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                        {errors.general && (
                            <div className="px-3 py-2.5 rounded-lg text-[12px] font-['DM_Mono',monospace]
                                bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)]
                                border border-[color-mix(in_oklch,var(--destructive)_30%,transparent)] text-destructive">
                                {errors.general}
                            </div>
                        )}

                        <div>
                            <Label>Title <span className="text-destructive">*</span></Label>
                            <input
                                className={fieldCls(errors.title)}
                                placeholder="2027 General Election"
                                value={data.title}
                                onChange={e => setData("title", e.target.value)}
                            />
                            <FieldError message={errors.title} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Type</Label>
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

                            <div>
                                <Label>Election Date</Label>
                                <input
                                    type="date"
                                    className={fieldCls(errors.election_date)}
                                    value={data.election_date}
                                    onChange={e => setData("election_date", e.target.value)}
                                />
                                <FieldError message={errors.election_date} />
                            </div>
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

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                            <button type="button" onClick={onClose}
                                className="px-5 py-[9px] rounded-lg text-[13px] font-['Syne',sans-serif] font-semibold
                                    border border-border bg-transparent text-foreground cursor-pointer hover:bg-muted transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={processing}
                                className="flex items-center gap-1.5 px-5 py-[9px] rounded-lg text-[13px]
                                    font-['Syne',sans-serif] font-semibold bg-primary text-primary-foreground
                                    border-none cursor-pointer disabled:opacity-60 transition-opacity">
                                {processing && <Loader size={14} className="animate-spin" />}
                                {isEdit ? "Save Changes" : "Create Election"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}