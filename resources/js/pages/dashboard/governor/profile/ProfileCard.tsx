import { useRef, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Camera, Pencil, X, Loader, CircleUser } from "lucide-react";
import { toast } from "react-toastify";
import profile from "@/routes/governor/profile";
import Portal from "@/components/Portal";

interface Role    { id: string; name: string; }
interface Profile {
    id: string; name: string; email: string;
    avatar: string | null; role?: Role; created_at: string;
}

// ── Primitives ────────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 font-['DM_Mono',monospace] text-[11px] text-destructive">{message}</p>;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfileCard({ profile: user }: { profile: Profile }) {
    const [editing,       setEditing]       = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const avatarRef = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.name,
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

        put(profile.info().url, {
            forceFormData: !!data.avatar,
            preserveScroll: true,
            onSuccess: () => {
                setEditing(false);
                setAvatarPreview(null);
            },
            onError: () => {},
        });
    };

    const handleClose = () => { setEditing(false); setAvatarPreview(null); reset(); };

    const avatarSrc   = avatarPreview ?? (user.avatar ? `/storage/${user.avatar}` : null);
    const memberSince = new Date(user.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

    return (
        <>
            {/* ── Card ─────────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <p className="font-['Syne',sans-serif] text-[14px] font-bold text-foreground">
                        Identity
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

                <div className="flex flex-col items-center text-center gap-4">
                    {/* Avatar */}
                    <div className="w-[90px] h-[90px] rounded-full flex-shrink-0 overflow-hidden
                        flex items-center justify-center
                        bg-[color-mix(in_oklch,var(--primary)_10%,var(--muted))]
                        border-[3px] border-[color-mix(in_oklch,var(--primary)_25%,transparent)]">
                        {avatarSrc
                            ? <img src={avatarSrc} alt={user.name} className="w-full h-full object-cover" />
                            : <CircleUser size={40} className="text-primary opacity-60" />
                        }
                    </div>

                    {/* Info */}
                    <div>
                        <p className="font-['Syne',sans-serif] text-[17px] font-extrabold text-foreground leading-tight">
                            {user.name}
                        </p>
                        <p className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground mt-[3px]">
                            {user.email}
                        </p>
                        {user.role && (
                            <span className="inline-flex mt-2 px-3 py-[3px] rounded-full text-[11px]
                                font-['DM_Mono',monospace] font-medium capitalize
                                text-primary
                                bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]
                                border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                                {user.role.name.replace(/_/g, " ")}
                            </span>
                        )}
                    </div>

                    {/* Member since */}
                    <div className="w-full px-3.5 py-2.5 rounded-[10px] mt-1
                        bg-[color-mix(in_oklch,var(--primary)_5%,transparent)]
                        border border-[color-mix(in_oklch,var(--primary)_12%,transparent)]">
                        <p className="font-['DM_Mono',monospace] text-[10px] text-muted-foreground uppercase tracking-[0.08em] mb-0.5">
                            Member Since
                        </p>
                        <p className="font-['DM_Mono',monospace] text-[12px] font-medium text-foreground">
                            {memberSince}
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
                                    Edit Identity
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="bg-transparent border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                                {/* Avatar upload */}
                                <div className="flex items-center gap-4">
                                    <div
                                        onClick={() => avatarRef.current?.click()}
                                        className="relative w-[72px] h-[72px] rounded-full flex-shrink-0 cursor-pointer
                                            overflow-hidden flex items-center justify-center transition-all
                                            bg-[color-mix(in_oklch,var(--primary)_10%,var(--muted))]
                                            border-2 border-dashed border-[color-mix(in_oklch,var(--primary)_40%,transparent)]
                                            hover:border-primary"
                                    >
                                        {avatarSrc
                                            ? <img src={avatarSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                            : <Camera size={22} className="text-primary" />
                                        }
                                    </div>

                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => avatarRef.current?.click()}
                                            className="font-['Syne',sans-serif] text-[13px] font-semibold text-primary
                                                bg-transparent border-none cursor-pointer"
                                        >
                                            Upload Photo
                                        </button>
                                        {avatarPreview && (
                                            <button
                                                type="button"
                                                onClick={() => { setAvatarPreview(null); setData("avatar", null); }}
                                                className="font-['Syne',sans-serif] text-[13px] text-destructive
                                                    bg-transparent border-none cursor-pointer ml-2.5"
                                            >
                                                Remove
                                            </button>
                                        )}
                                        <p className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground mt-1">
                                            JPG, PNG, GIF, WEBP · Max 2MB
                                        </p>
                                    </div>

                                    <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block mb-1.5 font-['DM_Mono',monospace] text-[12px] text-muted-foreground">
                                        Full Name <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData("name", e.target.value)}
                                        className={`w-full px-3 py-[9px] rounded-lg text-[13px] font-['DM_Mono',monospace]
                                            text-foreground bg-background outline-none transition-colors
                                            border ${errors.name ? "border-destructive" : "border-border"} focus:border-primary`}
                                    />
                                    <FieldError message={errors.name} />
                                </div>

                                {/* Footer */}
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