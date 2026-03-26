import { useEffect, useRef, useState } from "react";
import { useForm } from "@inertiajs/react";
import { X, Camera, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import users from "@/routes/users";
import Portal from "@/components/Portal";

// ─── Types ───────────────────────────────────────────────
interface Role  { id: string; name: string; }
interface Pu    { id: string; name: string; number?: string; }
interface Ward  { id: string; name: string; pus:   Pu[];   }
interface Lga   { id: string; name: string; wards: Ward[]; }
interface Zone  { id: string; name: string; lgas:  Lga[];  }
interface State { id: string; name: string; zones: Zone[]; }

interface User {
    id: string; name: string; email: string;
    avatar: string | null; role_id: string; role?: Role;
    location_type: string | null; location_id: string | null;
}

interface Props {
    open:    boolean;
    onClose: () => void;
    roles:   Role[];
    state:   State[];   // full nested tree from controller
    user?:   User | null;
}

// Matches Location enum values
const LOCATION_TYPES = [
    { value: "state", label: "State"        },
    { value: "zone",  label: "Zone"         },
    { value: "lga",   label: "LGA"          },
    { value: "ward",  label: "Ward"         },
    { value: "pu",    label: "Polling Unit" },
];

// ─── Shared input/select styles ──────────────────────────
const inputCls = (err?: string) => ({
    width: "100%", padding: "9px 12px",
    border: `1px solid ${err ? "var(--destructive)" : "var(--border)"}`,
    borderRadius: 8, fontSize: 13, fontFamily: "'DM Mono', monospace",
    color: "var(--foreground)", background: "var(--background)", outline: "none",
} as React.CSSProperties);

const selectCls = (err?: string) => ({
    ...inputCls(err),
    appearance: "none" as const, cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
    paddingRight: 32,
});

const labelCls: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace", fontSize: 12,
    color: "var(--muted-foreground)", display: "block", marginBottom: 6,
};

const errCls: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace", fontSize: 11,
    color: "var(--destructive)", marginTop: 4,
};

// ─── Main Component ──────────────────────────────────────
export default function UserModal({ open, onClose, roles, state, user }: Props) {
    const isEdit       = !!user;
    const avatarRef    = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showPassword, setShowPassword]   = useState(false);

    // Cascade selectors
    const [selState, setSelState] = useState<State | null>(null);
    const [selZone,  setSelZone]  = useState<Zone  | null>(null);
    const [selLga,   setSelLga]   = useState<Lga   | null>(null);
    const [selWard,  setSelWard]  = useState<Ward  | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name:          user?.name          ?? "",
        email:         user?.email         ?? "",
        password:      "",
        role_id:       user?.role_id       ?? "",
        avatar:        null as File | null,
        location_type: user?.location_type ?? "",
        location_id:   user?.location_id   ?? "",
    });

    // Reset everything when modal opens/closes
    useEffect(() => {
        if (!open) return;
        clearErrors();
        setAvatarPreview(null);
        setShowPassword(false);
        setSelState(null); setSelZone(null); setSelLga(null); setSelWard(null);

        if (user) {
            setData({
                name:          user.name,
                email:         user.email,
                password:      "",
                role_id:       user.role_id,
                avatar:        null,
                location_type: user.location_type ?? "",
                location_id:   user.location_id   ?? "",
            });
        } else {
            reset();
        }
    }, [open, user?.id]);

    // ── Location cascade handlers ─────────────────────────
    const handleLocationType = (type: string) => {
        setData({ ...data, location_type: type, location_id: "" });
        setSelState(null); setSelZone(null); setSelLga(null); setSelWard(null);
    };

    const handleStateSelect = (id: string) => {
        const s = state.find(x => x.id === id) ?? null;
        setSelState(s); setSelZone(null); setSelLga(null); setSelWard(null);
        if (data.location_type === "state") setData("location_id", id);
        else setData("location_id", "");
    };

    const handleZoneSelect = (id: string) => {
        const z = selState?.zones.find(x => x.id === id) ?? null;
        setSelZone(z); setSelLga(null); setSelWard(null);
        if (data.location_type === "zone") setData("location_id", id);
        else setData("location_id", "");
    };

    const handleLgaSelect = (id: string) => {
        const l = selZone?.lgas.find(x => x.id === id) ?? null;
        setSelLga(l); setSelWard(null);
        if (data.location_type === "lga") setData("location_id", id);
        else setData("location_id", "");
    };

    const handleWardSelect = (id: string) => {
        const w = selLga?.wards.find(x => x.id === id) ?? null;
        setSelWard(w);
        if (data.location_type === "ward") setData("location_id", id);
        else setData("location_id", "");
    };

    const handlePuSelect = (id: string) => {
        setData("location_id", id);
    };

    // ── Determine which selects to show based on type ─────
    const locType = data.location_type;
    const showState = !!locType;
    const showZone  = showState && !!selState  && ["zone","lga","ward","pu"].includes(locType);
    const showLga   = showZone  && !!selZone   && ["lga","ward","pu"].includes(locType);
    const showWard  = showLga   && !!selLga    && ["ward","pu"].includes(locType);
    const showPu    = showWard  && !!selWard   && locType === "pu";

    // ── Avatar ────────────────────────────────────────────
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Images only."); return; }
        setData("avatar", file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    // ── Submit ────────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = {
            forceFormData: true,
            onSuccess: () => { toast.success(isEdit ? "User updated." : "User created."); onClose(); },
            onError:   () => toast.error("Please fix the errors below."),
        };
        if (isEdit) {
            post(users.update.url(user!.id, { query: { _method: "PUT" } }), opts);
        } else {
            post(users.store().url, opts);
        }
    };

    const currentAvatar = avatarPreview ?? (user?.avatar ? `/storage/${user.avatar}` : null);

    if (!open) return null;

    return (
        <Portal>
            <style>{`
                @import url('https://fonts.bunny.net/css?family=dm-mono:400,500|syne:600,700');
                .um-overlay {
                    position: fixed; inset: 0; z-index: 200;
                    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
                    display: flex; align-items: flex-start; justify-content: center;
                    padding: 24px 16px; overflow-y: auto;
                    animation: umFadeIn 0.15s ease;
                }
                .um-box {
                    background: var(--card); border-radius: 16px;
                    width: 100%; max-width: 600px;
                    border: 1px solid var(--border);
                    box-shadow: 0 24px 60px rgba(0,0,0,0.2);
                    animation: umSlideUp 0.2s ease;
                    margin: auto;
                }
                .dark .um-box { background: #0f1117; }
                @keyframes umFadeIn  { from { opacity: 0 } to { opacity: 1 } }
                @keyframes umSlideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }

                .um-section-title {
                    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 0.08em;
                    color: var(--muted-foreground); margin-bottom: 12px;
                    padding-bottom: 6px; border-bottom: 1px solid var(--border);
                }
                .um-avatar-upload {
                    width: 72px; height: 72px; border-radius: 50%; flex-shrink: 0;
                    cursor: pointer; overflow: hidden; position: relative;
                    background: color-mix(in oklch, var(--primary) 10%, var(--muted));
                    border: 2px dashed color-mix(in oklch, var(--primary) 40%, transparent);
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .um-avatar-upload:hover { border-color: var(--primary); }
                .um-avatar-upload img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
            `}</style>

            <div className="um-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
                <div className="um-box">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
                        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "var(--foreground)" }}>
                            {isEdit ? "Edit User" : "Add User"}
                        </h2>
                        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

                        {/* Avatar */}
                        <div className="flex items-center gap-4">
                            <div className="um-avatar-upload" onClick={() => avatarRef.current?.click()}>
                                {currentAvatar
                                    ? <img src={currentAvatar} alt="avatar" />
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
                                    JPG, PNG, GIF · Max 2MB
                                </p>
                            </div>
                            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </div>

                        {/* User Information */}
                        <div>
                            <p className="um-section-title">User Information</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label style={labelCls}>Name <span style={{ color: "var(--destructive)" }}>*</span></label>
                                    <input type="text" style={inputCls(errors.name)} placeholder="Full name"
                                        value={data.name} onChange={e => setData("name", e.target.value)} />
                                    {errors.name && <p style={errCls}>{errors.name}</p>}
                                </div>

                                <div>
                                    <label style={labelCls}>Role <span style={{ color: "var(--destructive)" }}>*</span></label>
                                    <select style={selectCls(errors.role_id)} value={data.role_id} onChange={e => setData("role_id", e.target.value)}>
                                        <option value="">Select role</option>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                    {errors.role_id && <p style={errCls}>{errors.role_id}</p>}
                                </div>

                                <div>
                                    <label style={labelCls}>Email <span style={{ color: "var(--destructive)" }}>*</span></label>
                                    <input type="email" style={inputCls(errors.email)} placeholder="user@example.com"
                                        value={data.email} onChange={e => setData("email", e.target.value)} />
                                    {errors.email && <p style={errCls}>{errors.email}</p>}
                                </div>

                                <div>
                                    <label style={labelCls}>
                                        Password {!isEdit && <span style={{ color: "var(--destructive)" }}>*</span>}
                                        {isEdit && <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}> (leave blank to keep)</span>}
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <input type={showPassword ? "text" : "password"}
                                            style={{ ...inputCls(errors.password), paddingRight: 40 }}
                                            placeholder={isEdit ? "••••••••" : "Min. 6 characters"}
                                            value={data.password} onChange={e => setData("password", e.target.value)} />
                                        <button type="button" onClick={() => setShowPassword(v => !v)}
                                            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {errors.password && <p style={errCls}>{errors.password}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <p className="um-section-title">Location Assignment</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* Location Type */}
                                <div>
                                    <label style={labelCls}>Location Level <span style={{ color: "var(--destructive)" }}>*</span></label>
                                    <select style={selectCls(errors.location_type)} value={data.location_type}
                                        onChange={e => handleLocationType(e.target.value)}>
                                        <option value="">Select level</option>
                                        {LOCATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                    {errors.location_type && <p style={errCls}>{errors.location_type}</p>}
                                </div>

                                {/* State */}
                                {showState && (
                                    <div>
                                        <label style={labelCls}>State <span style={{ color: "var(--destructive)" }}>*</span></label>
                                        <select style={selectCls(locType === "state" ? errors.location_id : undefined)}
                                            value={selState?.id ?? ""} onChange={e => handleStateSelect(e.target.value)}>
                                            <option value="">Select state</option>
                                            {state.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        {locType === "state" && errors.location_id && <p style={errCls}>{errors.location_id}</p>}
                                    </div>
                                )}

                                {/* Zone */}
                                {showZone && (
                                    <div>
                                        <label style={labelCls}>Zone <span style={{ color: "var(--destructive)" }}>*</span></label>
                                        <select style={selectCls(locType === "zone" ? errors.location_id : undefined)}
                                            value={selZone?.id ?? ""} onChange={e => handleZoneSelect(e.target.value)}>
                                            <option value="">Select zone</option>
                                            {selState?.zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                        </select>
                                        {locType === "zone" && errors.location_id && <p style={errCls}>{errors.location_id}</p>}
                                    </div>
                                )}

                                {/* LGA */}
                                {showLga && (
                                    <div>
                                        <label style={labelCls}>LGA <span style={{ color: "var(--destructive)" }}>*</span></label>
                                        <select style={selectCls(locType === "lga" ? errors.location_id : undefined)}
                                            value={selLga?.id ?? ""} onChange={e => handleLgaSelect(e.target.value)}>
                                            <option value="">Select LGA</option>
                                            {selZone?.lgas.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                        {locType === "lga" && errors.location_id && <p style={errCls}>{errors.location_id}</p>}
                                    </div>
                                )}

                                {/* Ward */}
                                {showWard && (
                                    <div>
                                        <label style={labelCls}>Ward <span style={{ color: "var(--destructive)" }}>*</span></label>
                                        <select style={selectCls(locType === "ward" ? errors.location_id : undefined)}
                                            value={selWard?.id ?? ""} onChange={e => handleWardSelect(e.target.value)}>
                                            <option value="">Select ward</option>
                                            {selLga?.wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                        {locType === "ward" && errors.location_id && <p style={errCls}>{errors.location_id}</p>}
                                    </div>
                                )}

                                {/* Polling Unit */}
                                {showPu && (
                                    <div>
                                        <label style={labelCls}>Polling Unit <span style={{ color: "var(--destructive)" }}>*</span></label>
                                        <select style={selectCls(locType === "pu" ? errors.location_id : undefined)}
                                            value={data.location_id} onChange={e => handlePuSelect(e.target.value)}>
                                            <option value="">Select polling unit</option>
                                            {selWard?.pus.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.number ? `${p.number} — ` : ""}{p.name}
                                                </option>
                                            ))}
                                        </select>
                                        {locType === "pu" && errors.location_id && <p style={errCls}>{errors.location_id}</p>}
                                    </div>
                                )}
                            </div>

                            {/* Summary chip — shows selected location_id when resolved */}
                            {data.location_id && (
                                <div style={{
                                    marginTop: 10, padding: "6px 12px", borderRadius: 8, fontSize: 11,
                                    fontFamily: "'DM Mono', monospace",
                                    background: "color-mix(in oklch, var(--primary) 8%, transparent)",
                                    border: "1px solid color-mix(in oklch, var(--primary) 20%, transparent)",
                                    color: "var(--primary)",
                                }}>
                                    ✓ Location assigned: <strong>{LOCATION_TYPES.find(t => t.value === data.location_type)?.label}</strong>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                            <button type="button" onClick={onClose}
                                style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 600, border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", cursor: "pointer" }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={processing}
                                style={{ padding: "9px 20px", borderRadius: 8, fontSize: 13, fontFamily: "'Syne', sans-serif", fontWeight: 600, background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: processing ? 0.6 : 1 }}>
                                {processing && <Loader2 size={14} className="animate-spin" />}
                                {isEdit ? "Save Changes" : "Create User"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}