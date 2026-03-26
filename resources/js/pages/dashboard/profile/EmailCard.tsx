import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Pencil, X, Loader2, Mail } from "lucide-react";
import { toast } from "react-toastify";
import profile from "@/routes/profile";
import Portal from "@/components/Portal";

export default function EmailCard({ email }: { email: string }) {
    const [editing, setEditing] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email:    email,
        password: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(profile.email().url, {
            onSuccess: () => { toast.success("Email updated."); setEditing(false); reset(); },
            onError:   () => toast.error("Please fix the errors."),
        });
    };

    const handleClose = () => { setEditing(false); reset(); };

    const inputStyle = (hasError: boolean): React.CSSProperties => ({
        width: "100%", padding: "9px 12px",
        border: `1px solid ${hasError ? "var(--destructive)" : "var(--border)"}`,
        borderRadius: 8, fontSize: 13, fontFamily: "'DM Mono', monospace",
        color: "var(--foreground)", background: "var(--background)", outline: "none",
    });

    return (
        <>
            <div className="bg-card border rounded-2xl p-6 shadow-sm" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-4 mb-5">
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                        Email Address
                    </p>
                    <button onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:bg-muted"
                        style={{ fontFamily: "'Syne', sans-serif", borderColor: "var(--border)", color: "var(--foreground)", flexShrink: 0 }}>
                        <Pencil size={12} />
                        Edit
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: "color-mix(in oklch, var(--primary) 10%, transparent)",
                        border: "1px solid color-mix(in oklch, var(--primary) 20%, transparent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Mail size={16} style={{ color: "var(--primary)" }} />
                    </div>
                    <div className="min-w-0">
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "var(--foreground)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {email}
                        </p>
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
                            Your sign-in email address
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
                                Update Email
                            </p>
                            <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            <div>
                                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                                    New Email <span style={{ color: "var(--destructive)" }}>*</span>
                                </label>
                                <input type="email" value={data.email} onChange={e => setData("email", e.target.value)}
                                    style={inputStyle(!!errors.email)} placeholder="new@email.com" />
                                {errors.email && <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--destructive)", marginTop: 4 }}>{errors.email}</p>}
                            </div>

                            <div>
                                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                                    Confirm with Password <span style={{ color: "var(--destructive)" }}>*</span>
                                </label>
                                <input type="password" value={data.password} onChange={e => setData("password", e.target.value)}
                                    style={inputStyle(!!errors.password)} placeholder="Your current password" />
                                {errors.password && <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--destructive)", marginTop: 4 }}>{errors.password}</p>}
                            </div>

                            <div style={{
                                padding: "10px 14px", borderRadius: 8, fontSize: 11,
                                fontFamily: "'DM Mono', monospace", lineHeight: 1.6,
                                background: "color-mix(in oklch, var(--primary) 6%, transparent)",
                                border: "1px solid color-mix(in oklch, var(--primary) 15%, transparent)",
                                color: "var(--muted-foreground)",
                            }}>
                                You'll need to confirm your current password to change your email address.
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                                <button type="button" onClick={handleClose}
                                    style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 600, border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", cursor: "pointer" }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing}
                                    style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 600, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: processing ? 0.6 : 1 }}>
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