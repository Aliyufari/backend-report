import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Pencil, X, Loader, Lock, Eye, EyeClosed } from "lucide-react";
import { toast } from "react-toastify";
import profile from "@/routes/profile";
import Portal from "@/components/Portal";

function PasswordField({ label, value, onChange, error, show, onToggle, placeholder }: {
    label: string; value: string; onChange: (v: string) => void;
    error?: string; show: boolean; onToggle: () => void; placeholder: string;
}) {
    return (
        <div>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                {label} <span style={{ color: "var(--destructive)" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
                <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: "100%", padding: "9px 40px 9px 12px",
                        border: `1px solid ${error ? "var(--destructive)" : "var(--border)"}`,
                        borderRadius: 8, fontSize: 13, fontFamily: "'DM Mono', monospace",
                        color: "var(--foreground)", background: "var(--background)", outline: "none",
                    }} />
                <button type="button" onClick={onToggle}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
                    {show ? <EyeClosed size={14} /> : <Eye size={14} />}
                </button>
            </div>
            {error && <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--destructive)", marginTop: 4 }}>{error}</p>}
        </div>
    );
}

export default function PasswordCard() {
    const [editing, setEditing]         = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew]         = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        current_password:      "",
        password:              "",
        password_confirmation: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(profile.password().url, {
            onSuccess: () => { toast.success("Password updated."); setEditing(false); reset(); },
            onError:   () => toast.error("Please fix the errors."),
        });
    };

    const handleClose = () => { setEditing(false); reset(); };

    return (
        <>
            <div className="bg-card border rounded-2xl p-6 shadow-sm" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-4 mb-5">
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                        Password
                    </p>
                    <button onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:bg-muted"
                        style={{ fontFamily: "'Syne', sans-serif", borderColor: "var(--border)", color: "var(--foreground)", flexShrink: 0 }}>
                        <Pencil size={12} />
                        Change
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: "color-mix(in oklch, var(--primary) 10%, transparent)",
                        border: "1px solid color-mix(in oklch, var(--primary) 20%, transparent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Lock size={16} style={{ color: "var(--primary)" }} />
                    </div>
                    <div>
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "var(--foreground)", letterSpacing: "0.2em" }}>
                            ••••••••••
                        </p>
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
                            Keep your account secure
                        </p>
                    </div>
                </div>
            </div>

            {editing && (
                <Portal>
                <div className="profile-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
                    <div className="profile-modal-box">
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>
                                Change Password
                            </p>
                            <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            <PasswordField label="Current Password" value={data.current_password}
                                onChange={v => setData("current_password", v)} error={errors.current_password}
                                show={showCurrent} onToggle={() => setShowCurrent(v => !v)} placeholder="Enter current password" />

                            <PasswordField label="New Password" value={data.password}
                                onChange={v => setData("password", v)} error={errors.password}
                                show={showNew} onToggle={() => setShowNew(v => !v)} placeholder="Min. 8 characters" />

                            <PasswordField label="Confirm New Password" value={data.password_confirmation}
                                onChange={v => setData("password_confirmation", v)} error={errors.password_confirmation}
                                show={showConfirm} onToggle={() => setShowConfirm(v => !v)} placeholder="Repeat new password" />

                            <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                                <button type="button" onClick={handleClose}
                                    style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 600, border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", cursor: "pointer" }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing}
                                    style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 600, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: processing ? 0.6 : 1 }}>
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