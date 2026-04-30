import { useEffect, useRef, useState } from "react";
import { useForm } from "@inertiajs/react";
import { X, Camera, Loader, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import users from "@/routes/users";
import Portal from "@/components/Portal";

interface Role  { id: number; name: string; }
interface Pu    { id: string; name: string; number?: string; }
interface Ward  { id: string; name: string; pus:   Pu[];   }
interface Lga   { id: string; name: string; wards: Ward[]; }
interface Zone  { id: string; name: string; lgas:  Lga[];  }
interface State { id: string; name: string; zones: Zone[]; }

interface User {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role?: { id: number; name: string } | null;
    location_type: string | null;
    location_id: string | null;
}

interface Props {
    open:    boolean;
    onClose: () => void;
    roles:   Role[];
    states:  State[];
    user?:   User | null;
}

const LOCATION_TYPES = [
    { value: "state", label: "State"        },
    { value: "zone",  label: "Zone"         },
    { value: "lga",   label: "LGA"          },
    { value: "ward",  label: "Ward"         },
    { value: "pu",    label: "Polling Unit" },
];

// ── Reusable field primitives ─────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground block mb-1.5">
            {children}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="font-['DM_Mono',monospace] text-[11px] text-destructive mt-1">{message}</p>;
}

function Input({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
    return (
        <input
            {...props}
            className={`w-full px-3 py-[9px] rounded-lg text-[13px] font-['DM_Mono',monospace]
                text-foreground bg-background outline-none transition-colors
                border ${error ? "border-destructive" : "border-border"}
                focus:border-primary`}
        />
    );
}

function Select({ error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
    return (
        <select
            {...props}
            className={`w-full px-3 py-[9px] pr-8 rounded-lg text-[13px] font-['DM_Mono',monospace]
                text-foreground bg-background outline-none cursor-pointer appearance-none transition-colors
                border ${error ? "border-destructive" : "border-border"}
                focus:border-primary
                bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")]
                bg-no-repeat bg-[right_12px_center]`}
        >
            {children}
        </select>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserModal({ open, onClose, roles, states, user }: Props) {
    const isEdit    = !!user;
    const avatarRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showPassword, setShowPassword]   = useState(false);

    const [selState, setSelState] = useState<State | null>(null);
    const [selZone,  setSelZone]  = useState<Zone  | null>(null);
    const [selLga,   setSelLga]   = useState<Lga   | null>(null);
    const [selWard,  setSelWard]  = useState<Ward  | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name:          user?.name                 ?? "",
        email:         user?.email                ?? "",
        password:      "",
        role_id:       user?.role?.id?.toString() ?? "",
        avatar:        null as File | null,
        location_type: user?.location_type        ?? "",
        location_id:   user?.location_id          ?? "",
    });

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
                role_id:       user.role?.id?.toString() ?? "",
                avatar:        null,
                location_type: user.location_type ?? "",
                location_id:   user.location_id   ?? "",
            });
        } else {
            reset();
        }
    }, [open, user?.id]);

    // ── Location cascade ──────────────────────────────────────────────────────

    const handleLocationType = (type: string) => {
        setData({ ...data, location_type: type, location_id: "" });
        setSelState(null); setSelZone(null); setSelLga(null); setSelWard(null);
    };

    const handleStateSelect = (id: string) => {
        const s = states.find(x => x.id === id) ?? null;
        setSelState(s); setSelZone(null); setSelLga(null); setSelWard(null);
        setData("location_id", data.location_type === "state" ? id : "");
    };

    const handleZoneSelect = (id: string) => {
        const z = selState?.zones.find(x => x.id === id) ?? null;
        setSelZone(z); setSelLga(null); setSelWard(null);
        setData("location_id", data.location_type === "zone" ? id : "");
    };

    const handleLgaSelect = (id: string) => {
        const l = selZone?.lgas.find(x => x.id === id) ?? null;
        setSelLga(l); setSelWard(null);
        setData("location_id", data.location_type === "lga" ? id : "");
    };

    const handleWardSelect = (id: string) => {
        const w = selLga?.wards.find(x => x.id === id) ?? null;
        setSelWard(w);
        setData("location_id", data.location_type === "ward" ? id : "");
    };

    const handlePuSelect = (id: string) => setData("location_id", id);

    const locType   = data.location_type;
    const showState = !!locType;
    const showZone  = showState && !!selState && ["zone","lga","ward","pu"].includes(locType);
    const showLga   = showZone  && !!selZone  && ["lga","ward","pu"].includes(locType);
    const showWard  = showLga   && !!selLga   && ["ward","pu"].includes(locType);
    const showPu    = showWard  && !!selWard  && locType === "pu";

    // ── Avatar ────────────────────────────────────────────────────────────────

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Images only."); return; }
        setData("avatar", file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { forceFormData: true, onSuccess: () => onClose(), onError: () => {} };
        isEdit
            ? post(users.update.url(user!.id, { query: { _method: "PUT" } }), opts)
            : post(users.store().url, opts);
    };

    const currentAvatar = avatarPreview ?? (user?.avatar ? `/storage/${user.avatar}` : null);

    if (!open) return null;

    return (
        <Portal>
            {/* Overlay */}
            <div
                className="animate-fade-in fixed inset-0 z-[200] flex items-start justify-center px-4 py-6 overflow-y-auto
                    bg-black/50 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                {/* Box */}
                <div className="animate-slide-up bg-card dark:bg-[#0f1117] border border-border rounded-2xl w-full max-w-[600px]
                    shadow-[0_24px_60px_rgba(0,0,0,0.2)] my-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
                        <h2 className="font-['Syne',sans-serif] text-[17px] font-bold text-foreground">
                            {isEdit ? "Edit User" : "Add User"}
                        </h2>
                        <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

                        {/* Avatar */}
                        <div className="flex items-center gap-4">
                            <div
                                onClick={() => avatarRef.current?.click()}
                                className="relative w-[72px] h-[72px] rounded-full flex-shrink-0 cursor-pointer overflow-hidden
                                    flex items-center justify-center transition-all
                                    bg-[color-mix(in_oklch,var(--primary)_10%,var(--muted))]
                                    border-2 border-dashed border-[color-mix(in_oklch,var(--primary)_40%,transparent)]
                                    hover:border-primary"
                            >
                                {currentAvatar
                                    ? <img src={currentAvatar} alt="avatar" className="absolute inset-0 w-full h-full object-cover" />
                                    : <Camera size={22} className="text-primary" />
                                }
                            </div>

                            <div>
                                <button type="button" onClick={() => avatarRef.current?.click()}
                                    className="font-['Syne',sans-serif] text-[13px] font-semibold text-primary bg-transparent border-none cursor-pointer">
                                    Upload Photo
                                </button>
                                {avatarPreview && (
                                    <button type="button"
                                        onClick={() => { setAvatarPreview(null); setData("avatar", null); }}
                                        className="font-['Syne',sans-serif] text-[13px] text-destructive bg-transparent border-none cursor-pointer ml-2.5">
                                        Remove
                                    </button>
                                )}
                                <p className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground mt-1">
                                    JPG, PNG, GIF · Max 2MB
                                </p>
                            </div>

                            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </div>

                        {/* User Information */}
                        <div>
                            <p className="font-['Syne',sans-serif] text-[12px] font-bold uppercase tracking-[0.08em]
                                text-muted-foreground mb-3 pb-1.5 border-b border-border">
                                User Information
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>Name <span className="text-destructive">*</span></Label>
                                    <Input error={errors.name} type="text" placeholder="Full name"
                                        value={data.name} onChange={e => setData("name", e.target.value)} />
                                    <FieldError message={errors.name} />
                                </div>

                                <div>
                                    <Label>Role <span className="text-destructive">*</span></Label>
                                    <Select error={errors.role_id} value={data.role_id}
                                        onChange={e => setData("role_id", e.target.value)}>
                                        <option value="">Select role</option>
                                        {roles.map(r => <option key={r.id} value={r.id.toString()}>{r.name}</option>)}
                                    </Select>
                                    <FieldError message={errors.role_id} />
                                </div>

                                <div>
                                    <Label>Email <span className="text-destructive">*</span></Label>
                                    <Input error={errors.email} type="email" placeholder="user@example.com"
                                        value={data.email} onChange={e => setData("email", e.target.value)} />
                                    <FieldError message={errors.email} />
                                </div>

                                <div>
                                    <Label>
                                        Password {!isEdit && <span className="text-destructive">*</span>}
                                        {isEdit && <span className="text-[10px] text-muted-foreground"> (leave blank to keep)</span>}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            error={errors.password}
                                            type={showPassword ? "text" : "password"}
                                            className="pr-10"
                                            placeholder={isEdit ? "••••••••" : "Min. 6 characters"}
                                            value={data.password}
                                            onChange={e => setData("password", e.target.value)}
                                        />
                                        <button type="button" onClick={() => setShowPassword(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-muted-foreground">
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    <FieldError message={errors.password} />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <p className="font-['Syne',sans-serif] text-[12px] font-bold uppercase tracking-[0.08em]
                                text-muted-foreground mb-3 pb-1.5 border-b border-border">
                                Location Assignment
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <div>
                                    <Label>Location Level <span className="text-destructive">*</span></Label>
                                    <Select error={errors.location_type} value={data.location_type}
                                        onChange={e => handleLocationType(e.target.value)}>
                                        <option value="">Select level</option>
                                        {LOCATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </Select>
                                    <FieldError message={errors.location_type} />
                                </div>

                                {showState && (
                                    <div>
                                        <Label>State <span className="text-destructive">*</span></Label>
                                        <Select error={locType === "state" ? errors.location_id : undefined}
                                            value={selState?.id ?? ""} onChange={e => handleStateSelect(e.target.value)}>
                                            <option value="">Select state</option>
                                            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </Select>
                                        {locType === "state" && <FieldError message={errors.location_id} />}
                                    </div>
                                )}

                                {showZone && (
                                    <div>
                                        <Label>Zone <span className="text-destructive">*</span></Label>
                                        <Select error={locType === "zone" ? errors.location_id : undefined}
                                            value={selZone?.id ?? ""} onChange={e => handleZoneSelect(e.target.value)}>
                                            <option value="">Select zone</option>
                                            {selState?.zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                        </Select>
                                        {locType === "zone" && <FieldError message={errors.location_id} />}
                                    </div>
                                )}

                                {showLga && (
                                    <div>
                                        <Label>LGA <span className="text-destructive">*</span></Label>
                                        <Select error={locType === "lga" ? errors.location_id : undefined}
                                            value={selLga?.id ?? ""} onChange={e => handleLgaSelect(e.target.value)}>
                                            <option value="">Select LGA</option>
                                            {selZone?.lgas.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </Select>
                                        {locType === "lga" && <FieldError message={errors.location_id} />}
                                    </div>
                                )}

                                {showWard && (
                                    <div>
                                        <Label>Ward <span className="text-destructive">*</span></Label>
                                        <Select error={locType === "ward" ? errors.location_id : undefined}
                                            value={selWard?.id ?? ""} onChange={e => handleWardSelect(e.target.value)}>
                                            <option value="">Select ward</option>
                                            {selLga?.wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </Select>
                                        {locType === "ward" && <FieldError message={errors.location_id} />}
                                    </div>
                                )}

                                {showPu && (
                                    <div>
                                        <Label>Polling Unit <span className="text-destructive">*</span></Label>
                                        <Select error={locType === "pu" ? errors.location_id : undefined}
                                            value={data.location_id} onChange={e => handlePuSelect(e.target.value)}>
                                            <option value="">Select polling unit</option>
                                            {selWard?.pus.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.number ? `${p.number} — ` : ""}{p.name}
                                                </option>
                                            ))}
                                        </Select>
                                        {locType === "pu" && <FieldError message={errors.location_id} />}
                                    </div>
                                )}
                            </div>

                            {data.location_id && (
                                <div className="mt-2.5 px-3 py-1.5 rounded-lg text-[11px] font-['DM_Mono',monospace]
                                    text-primary
                                    bg-[color-mix(in_oklch,var(--primary)_8%,transparent)]
                                    border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                                    ✓ Location assigned: <strong>{LOCATION_TYPES.find(t => t.value === data.location_type)?.label}</strong>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                            <button type="button" onClick={onClose}
                                className="px-5 py-[9px] rounded-lg text-[13px] font-['Syne',sans-serif] font-semibold
                                    border border-border bg-transparent text-foreground cursor-pointer
                                    hover:bg-muted transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={processing}
                                className="flex items-center gap-1.5 px-5 py-[9px] rounded-lg text-[13px]
                                    font-['Syne',sans-serif] font-semibold bg-primary text-primary-foreground
                                    border-none cursor-pointer disabled:opacity-60 transition-opacity">
                                {processing && <Loader size={14} className="animate-spin" />}
                                {isEdit ? "Save Changes" : "Create User"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
}