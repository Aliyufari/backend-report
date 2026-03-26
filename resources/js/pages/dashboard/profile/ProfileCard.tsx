import { useRef, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Camera, Pencil, X, Loader2, CircleUser } from "lucide-react";
import { toast } from "react-toastify";
import profile from "@/routes/profile";
import Portal from "@/components/Portal";

interface Role { id: string; name: string; }
interface Profile {
    id: string; name: string; email: string;
    avatar: string | null; role?: Role; created_at: string;
}

export default function ProfileCard({ profile: user }: { profile: Profile }) {
    const [editing, setEditing]             = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const avatarRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name:   user.name,
        avatar: null as File | null,
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Images only."); return; }
        setData("avatar", file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(profile.info().url, {
            forceFormData: true,
            onSuccess: () => { toast.success("Profile updated."); setEditing(false); setAvatarPreview(null); },
            onError:   () => toast.error("Please fix the errors."),
        });
    };

    const handleClose = () => { setEditing(false); setAvatarPreview(null); reset(); };

    const avatarSrc  = avatarPreview ?? (user.avatar ? `/storage/${user.avatar}` : null);
    const memberSince = new Date(user.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

    return (
        <>
            <div className="bg-card border rounded-2xl p-6 shadow-sm h-full" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-4 mb-6">
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                        Identity
                    </p>
                    <button onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:bg-muted"
                        style={{ fontFamily: "'Syne', sans-serif", borderColor: "var(--border)", color: "var(--foreground)", flexShrink: 0 }}>
                        <Pencil size={12} />
                        Edit
                    </button>
                </div>

                {/* Avatar centered */}
                <div className="flex flex-col items-center text-center gap-4">
                    <div style={{
                        width: 90, height: 90, borderRadius: "50%", flexShrink: 0,
                        background: "color-mix(in oklch, var(--primary) 10%, var(--muted))",
                        border: "3px solid color-mix(in oklch, var(--primary) 25%, transparent)",
                        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        {avatarSrc
                            ? <img src={avatarSrc} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <CircleUser size={40} style={{ color: "var(--primary)", opacity: 0.6 }} />
                        }
                    </div>

                    <div>
                        <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--foreground)", lineHeight: 1.2 }}>
                            {user.name}
                        </p>
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--muted-foreground)", marginTop: 3 }}>
                            {user.email}
                        </p>
                        {user.role && (
                            <span style={{
                                display: "inline-flex", marginTop: 8,
                                padding: "3px 12px", borderRadius: 20, fontSize: 11,
                                fontFamily: "'DM Mono', monospace", fontWeight: 500,
                                background: "color-mix(in oklch, var(--primary) 10%, transparent)",
                                color: "var(--primary)",
                                border: "1px solid color-mix(in oklch, var(--primary) 20%, transparent)",
                                textTransform: "capitalize",
                            }}>
                                {user.role.name.replace(/_/g, " ")}
                            </span>
                        )}
                    </div>

                    <div style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10, marginTop: 4,
                        background: "color-mix(in oklch, var(--primary) 5%, transparent)",
                        border: "1px solid color-mix(in oklch, var(--primary) 12%, transparent)",
                    }}>
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                            Member Since
                        </p>
                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--foreground)", fontWeight: 500 }}>
                            {memberSince}
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editing && (
                <Portal>
                <div className="profile-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
                    <div className="profile-modal-box">
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                            <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>
                                Edit Identity
                            </p>
                            <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                            {/* Avatar upload */}
                            <div className="flex items-center gap-4">
                                <div onClick={() => avatarRef.current?.click()} style={{
                                    width: 72, height: 72, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
                                    background: "color-mix(in oklch, var(--primary) 10%, var(--muted))",
                                    border: "2px dashed color-mix(in oklch, var(--primary) 40%, transparent)",
                                    overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                                    position: "relative", transition: "all 0.2s",
                                }}>
                                    {avatarSrc
                                        ? <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <Camera size={22} style={{ color: "var(--primary)" }} />
                                    }
                                </div>
                                <div>
                                    <button type="button" onClick={() => avatarRef.current?.click()}
                                        style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}>
                                        Upload Photo
                                    </button>
                                    {avatarPreview && (
                                        <button type="button" onClick={() => { setAvatarPreview(null); setData("avatar", null); }}
                                            style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, color: "var(--destructive)", background: "none", border: "none", cursor: "pointer", marginLeft: 10 }}>
                                            Remove
                                        </button>
                                    )}
                                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", marginTop: 4 }}>
                                        JPG, PNG, GIF, WEBP · Max 2MB
                                    </p>
                                </div>
                                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </div>

                            {/* Name */}
                            <div>
                                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                                    Full Name <span style={{ color: "var(--destructive)" }}>*</span>
                                </label>
                                <input type="text" value={data.name} onChange={e => setData("name", e.target.value)}
                                    style={{
                                        width: "100%", padding: "9px 12px",
                                        border: `1px solid ${errors.name ? "var(--destructive)" : "var(--border)"}`,
                                        borderRadius: 8, fontSize: 13, fontFamily: "'DM Mono', monospace",
                                        color: "var(--foreground)", background: "var(--background)", outline: "none",
                                    }} />
                                {errors.name && <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--destructive)", marginTop: 4 }}>{errors.name}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                                <button type="button" onClick={handleClose}
                                    style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 600, border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", cursor: "pointer" }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing}
                                    style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 600, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: processing ? 0.6 : 1 }}>
                                    {processing && <Loader2 size={13} className="animate-spin" />}
                                    Save Changes
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