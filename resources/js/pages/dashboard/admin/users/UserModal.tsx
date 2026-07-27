import { useEffect, useRef, useState } from "react";
import { useForm } from "@inertiajs/react";
import { X, Camera, Loader, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import users from "@/routes/admin/users";
import Portal from "@/components/Portal";

interface Role { id: number; name: string; }
interface PuOption { id: string; name: string; number?: string; }

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
type LocationLevel = "state" | "zone" | "lga" | "ward" | "pu";

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
    open:          boolean;
    onClose:       () => void;
    roles:         Role[];
    locations:     LocationNode[];
    locationScope: LocationScope;
    user?:         User | null;
}

const LEVELS: LocationLevel[] = ["state", "zone", "lga", "ward", "pu"];
const LEVEL_LABELS: Record<LocationLevel, string> = {
    state: "State", zone: "Zone", lga: "LGA", ward: "Ward", pu: "Polling Unit",
};

// Cascading chain definition — each entry is a selectable dropdown level
// (excluding "pu", which is handled by a dedicated final picker sourced
// from the last chain level's `pus` array, same pattern as CvrModal).
const CHAIN_DEFS: { level: LocationLevel; childKey: string }[] = [
    { level: "state", childKey: "zones" },
    { level: "zone",  childKey: "lgas"  },
    { level: "lga",   childKey: "wards" },
    { level: "ward",  childKey: "pus"   },
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

export default function UserModal({ open, onClose, roles, locations, locationScope, user }: Props) {
    const isEdit    = !!user;
    const avatarRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showPassword, setShowPassword]   = useState(false);

    const scopeIndex   = LEVELS.indexOf(locationScope);       // 0..3
    const chain         = CHAIN_DEFS.slice(scopeIndex);       // dropdown levels available, from scope down to "ward"
    const availableTypes = LEVELS.slice(scopeIndex);          // e.g. ward -> ["ward","pu"]

    const [selected, setSelected] = useState<(LocationNode | null)[]>(() => chain.map(() => null));

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name:          user?.name                ?? "",
        email:         user?.email                ?? "",
        password:      "",
        role_id:       user?.role?.id?.toString() ?? "",
        avatar:        null as File | null,
        location_type: (user?.location_type as LocationLevel) ?? "",
        location_id:   user?.location_id          ?? "",
    });

    useEffect(() => {
        if (!open) return;
        clearErrors();
        setAvatarPreview(null);
        setShowPassword(false);

        const initial = chain.map(() => null as LocationNode | null);
        // Scoped roles typically have a single root location — preselect it.
        if (locations.length === 1) initial[0] = locations[0];
        setSelected(initial);

        if (user) {
            setData({
                name:          user.name,
                email:         user.email,
                password:      "",
                role_id:       user.role?.id?.toString() ?? "",
                avatar:        null,
                location_type: (user.location_type as LocationLevel) ?? "",
                location_id:   user.location_id   ?? "",
            });
        } else {
            reset();
        }
    }, [open, user?.id]);

    // ── Location cascade ──────────────────────────────────────────────────────

    const locType = data.location_type as LocationLevel | "";

    const handleLocationType = (type: string) => {
        setData({ ...data, location_type: type as LocationLevel, location_id: "" });
        setSelected(chain.map(() => null));
    };

    const targetChainIndex = locType === "pu"
        ? chain.length - 1
        : chain.findIndex(c => c.level === locType);

    const handleSelect = (levelIndex: number, node: LocationNode | null) => {
        setSelected(prev => {
            const next = [...prev];
            next[levelIndex] = node;
            for (let i = levelIndex + 1; i < next.length; i++) next[i] = null;
            return next;
        });

        if (locType !== "pu" && levelIndex === targetChainIndex) {
            setData("location_id", node?.id ?? "");
        } else {
            setData("location_id", "");
        }
    };

    const optionsForLevel = (levelIndex: number): LocationNode[] => {
        if (levelIndex === 0) return locations;
        const parent = selected[levelIndex - 1];
        if (!parent) return [];
        const key = chain[levelIndex - 1].childKey;
        return (parent[key] as LocationNode[] | undefined) ?? [];
    };

    const lastChainNode = selected[chain.length - 1];
    const puOptions: PuOption[] = lastChainNode ? (lastChainNode.pus ?? []) : [];

    const handlePuSelect = (id: string) => setData("location_id", id);

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
        const opts = { forceFormData: true, onSuccess: () => onClose(), preserveScroll: true };
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

                        {/* General error banner */}
                        {errors.general && (
                            <div className="px-3 py-2.5 rounded-lg text-[12px] font-['DM_Mono',monospace]
                                bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)]
                                border border-[color-mix(in_oklch,var(--destructive)_30%,transparent)] text-destructive">
                                {errors.general}
                            </div>
                        )}

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
                                    <Select error={errors.location_type} value={locType}
                                        onChange={e => handleLocationType(e.target.value)}>
                                        <option value="">Select level</option>
                                        {availableTypes.map(t => (
                                            <option key={t} value={t}>{LEVEL_LABELS[t]}</option>
                                        ))}
                                    </Select>
                                    <FieldError message={errors.location_type} />
                                </div>

                                {chain.map((def, idx) => {
                                    if (targetChainIndex < 0 || idx > targetChainIndex) return null;
                                    if (idx > 0 && !selected[idx - 1]) return null;

                                    const opts = optionsForLevel(idx);

                                    return (
                                        <div key={def.level}>
                                            <Label>{LEVEL_LABELS[def.level]} <span className="text-destructive">*</span></Label>
                                            <Select
                                                error={locType === def.level ? errors.location_id : undefined}
                                                value={selected[idx]?.id ?? ""}
                                                onChange={e => handleSelect(idx, opts.find(o => o.id === e.target.value) ?? null)}
                                            >
                                                <option value="">Select {LEVEL_LABELS[def.level].toLowerCase()}</option>
                                                {opts.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                            </Select>
                                            {locType === def.level && <FieldError message={errors.location_id} />}
                                        </div>
                                    );
                                })}

                                {locType === "pu" && lastChainNode && (
                                    <div>
                                        <Label>Polling Unit <span className="text-destructive">*</span></Label>
                                        <Select error={errors.location_id} value={data.location_id}
                                            onChange={e => handlePuSelect(e.target.value)}>
                                            <option value="">Select polling unit</option>
                                            {puOptions.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.number ? `${p.number} — ` : ""}{p.name}
                                                </option>
                                            ))}
                                        </Select>
                                        <FieldError message={errors.location_id} />
                                    </div>
                                )}
                            </div>

                            {data.location_id && (
                                <div className="mt-2.5 px-3 py-1.5 rounded-lg text-[11px] font-['DM_Mono',monospace]
                                    text-primary
                                    bg-[color-mix(in_oklch,var(--primary)_8%,transparent)]
                                    border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                                    ✓ Location assigned: <strong>{LEVEL_LABELS[locType as LocationLevel]}</strong>
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