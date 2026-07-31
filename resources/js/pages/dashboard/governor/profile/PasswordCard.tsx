import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Pencil, X, Loader, Lock, Eye, EyeClosed } from "lucide-react";
import profile from "@/routes/governor/profile";
import Portal from "@/components/Portal";

// ── Primitives ────────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 font-['DM_Mono',monospace] text-[11px] text-destructive">{message}</p>;
}

function PasswordField({ label, value, onChange, error, show, onToggle, placeholder }: {
    label:       string;
    value:       string;
    onChange:    (v: string) => void;
    error?:      string;
    show:        boolean;
    onToggle:    () => void;
    placeholder: string;
}) {
    return (
        <div>
            <label className="block mb-1.5 font-['DM_Mono',monospace] text-[12px] text-muted-foreground">
                {label} <span className="text-destructive">*</span>
            </label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full px-3 pr-10 py-[9px] rounded-lg text-[13px] font-['DM_Mono',monospace]
                        text-foreground bg-background outline-none transition-colors
                        border ${error ? "border-destructive" : "border-border"} focus:border-primary`}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none
                        cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                >
                    {show ? <EyeClosed size={14} /> : <Eye size={14} />}
                </button>
            </div>
            <FieldError message={error} />
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PasswordCard() {
    const [editing,     setEditing]     = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew,     setShowNew]     = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password:      "",
        password:              "",
        password_confirmation: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(profile.password().url, {
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
                        Password
                    </p>
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border
                            text-xs font-semibold font-['Syne',sans-serif] text-foreground flex-shrink-0
                            transition-all hover:bg-muted"
                    >
                        <Pencil size={12} />
                        Change
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-[38px] h-[38px] rounded-[10px] flex-shrink-0 flex items-center justify-center
                        bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]
                        border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                        <Lock size={16} className="text-primary" />
                    </div>
                    <div>
                        <p className="font-['DM_Mono',monospace] text-[14px] text-foreground tracking-[0.2em]">
                            ••••••••••
                        </p>
                        <p className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground mt-0.5">
                            Keep your account secure
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
                            w-full max-w-md shadow-[0_24px_60px_rgba(0,0,0,0.2)] animate-[slideUp_0.2s_ease]
                            max-h-[calc(100dvh-48px)] overflow-y-auto">

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
                                <p className="font-['Syne',sans-serif] text-[16px] font-bold text-foreground">
                                    Change Password
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                                <PasswordField
                                    label="Current Password"
                                    value={data.current_password}
                                    onChange={v => setData("current_password", v)}
                                    error={errors.current_password}
                                    show={showCurrent}
                                    onToggle={() => setShowCurrent(v => !v)}
                                    placeholder="Enter current password"
                                />
                                <PasswordField
                                    label="New Password"
                                    value={data.password}
                                    onChange={v => setData("password", v)}
                                    error={errors.password}
                                    show={showNew}
                                    onToggle={() => setShowNew(v => !v)}
                                    placeholder="Min. 8 characters"
                                />
                                <PasswordField
                                    label="Confirm New Password"
                                    value={data.password_confirmation}
                                    onChange={v => setData("password_confirmation", v)}
                                    error={errors.password_confirmation}
                                    show={showConfirm}
                                    onToggle={() => setShowConfirm(v => !v)}
                                    placeholder="Repeat new password"
                                />

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
                                        {processing && <Loader size={13} className="animate-spin" />}
                                        Update Password
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