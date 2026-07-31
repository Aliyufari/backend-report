import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Pencil, X, Loader2, Mail } from "lucide-react";
import profile from "@/routes/coordinator/profile";
import Portal from "@/components/Portal";

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

function Input({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
    return (
        <input
            {...props}
            className={`w-full px-3 py-[9px] rounded-lg text-[13px] font-['DM_Mono',monospace]
                text-foreground bg-background outline-none transition-colors
                border ${error ? "border-destructive" : "border-border"} focus:border-primary`}
        />
    );
}

export default function EmailCard({ email }: { email: string }) {
    const [editing, setEditing] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email,
        password: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(profile.email().url, {
            onSuccess: () => { setEditing(false); reset(); },
            onError:   () => {},
        });
    };

    const handleClose = () => { setEditing(false); reset(); };

    return (
        <>
            {/* ── Card ─────────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-5">
                    <p className="font-['Syne',sans-serif] text-[14px] font-bold text-foreground">
                        Email Address
                    </p>
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border
                            text-xs font-semibold font-['Syne',sans-serif] text-foreground flex-shrink-0
                            transition-all hover:bg-muted"
                    >
                        <Pencil size={12} />
                        Edit
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-[38px] h-[38px] rounded-[10px] flex-shrink-0 flex items-center justify-center
                        bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]
                        border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                        <Mail size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-['DM_Mono',monospace] text-[13px] font-medium text-foreground truncate">
                            {email}
                        </p>
                        <p className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground mt-0.5">
                            Your sign-in email address
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Modal ────────────────────────────────────────────── */}
            {editing && (
                <Portal>
                    <div
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4
                            bg-black/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease]"
                        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
                    >
                        <div className="bg-card dark:bg-[#0f1117] border border-border rounded-2xl
                            w-full max-w-md shadow-[0_24px_60px_rgba(0,0,0,0.2)] animate-[slideUp_0.2s_ease]">

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
                                <p className="font-['Syne',sans-serif] text-[16px] font-bold text-foreground">
                                    Update Email
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                                <div>
                                    <Label>New Email <span className="text-destructive">*</span></Label>
                                    <Input
                                        type="email"
                                        error={errors.email}
                                        placeholder="new@email.com"
                                        value={data.email}
                                        onChange={e => setData("email", e.target.value)}
                                    />
                                    <FieldError message={errors.email} />
                                </div>

                                <div>
                                    <Label>Confirm with Password <span className="text-destructive">*</span></Label>
                                    <Input
                                        type="password"
                                        error={errors.password}
                                        placeholder="Your current password"
                                        value={data.password}
                                        onChange={e => setData("password", e.target.value)}
                                    />
                                    <FieldError message={errors.password} />
                                </div>

                                <p className="px-3.5 py-2.5 rounded-lg text-[11px] font-['DM_Mono',monospace]
                                    leading-relaxed text-muted-foreground
                                    bg-[color-mix(in_oklch,var(--primary)_6%,transparent)]
                                    border border-[color-mix(in_oklch,var(--primary)_15%,transparent)]">
                                    You'll need to confirm your current password to change your email address.
                                </p>

                                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-[18px] py-2 rounded-lg text-[13px] font-['Syne',sans-serif]
                                            font-semibold border border-border bg-transparent text-foreground
                                            cursor-pointer hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center gap-1.5 px-[18px] py-2 rounded-lg text-[13px]
                                            font-['Syne',sans-serif] font-semibold bg-primary text-primary-foreground
                                            border-none cursor-pointer disabled:opacity-60 transition-opacity"
                                    >
                                        {processing && <Loader2 size={13} className="animate-spin" />}
                                        Update Email
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            )}
        </>
    );
}