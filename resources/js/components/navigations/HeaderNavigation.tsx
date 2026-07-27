import { AlignJustify, ChevronDown, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import Spinner from "@/pages/components/Spinner";
import MobileNavigation from "@/components/navigations/MobileNavigation";
import logo from "@/assets/images/logo.png";
import profile from "@/routes/settings/profile";

interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: { id: string; name: string } | null;
}

interface PageProps {
    auth: { user: AuthUser | null };
    [key: string]: unknown;
}

export default function HeaderNavigation() {
    const [showProfile,   setShowProfile]   = useState(false);
    const [showMobileNav, setShowMobileNav] = useState(false);
    const { props } = usePage<PageProps>();
    const user = props.auth?.user ?? null;

    useEffect(() => {
        const close = () => setShowProfile(false);
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, []);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post("/logout");
    };

    const roleLabel = user?.role?.name.replace(/_/g, " ") ?? "";

    return (
        <>
            <MobileNavigation
                showMobile={showMobileNav}
                onClose={() => setShowMobileNav(false)}
            />

            <div className="font-['Syne',sans-serif] flex items-center gap-3 w-full md:justify-end">

                {/* Mobile only: Logo + Site Name */}
                <div className="flex md:hidden items-center gap-2.5 flex-1">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex flex-col leading-none gap-[3px]">
                        <p className="text-foreground text-sm font-bold leading-tight">
                            Backend Report
                        </p>
                        <p className="font-['DM_Mono',monospace] text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
                            INEC Monitor
                        </p>
                    </div>
                </div>

                {/* Live indicator — desktop only */}
                <div className="hidden md:flex items-center gap-1.5 font-['DM_Mono',monospace] text-xs text-muted-foreground">
                    <span className="animate-pulse w-1.5 h-1.5 rounded-full inline-block bg-primary" />
                    <span>LIVE</span>
                </div>

                <div className="w-px h-5 hidden md:block bg-border" />

                {/* Profile */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowProfile((v) => !v); }}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:bg-accent"
                    >
                        {/* Avatar */}
                        <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            font-['DM_Mono',monospace] text-[13px] font-bold text-primary
                            bg-primary/10 border border-primary/25 transition-all duration-200
                            ${showProfile ? "ring-2 ring-primary/40 shadow-[0_0_12px_color-mix(in_oklch,var(--primary)_15%,transparent)]" : ""}
                        `}>
                            {!user
                                ? <Spinner size={14} color="var(--primary)" />
                                : user.name?.charAt(0).toUpperCase()
                            }
                        </div>

                        {/* Name + role — desktop only */}
                        {user?.id && (
                            <div className="hidden md:flex flex-col items-start gap-0.5">
                                <span className="text-xs font-semibold leading-none capitalize text-foreground">
                                    {user.name}
                                </span>
                                {roleLabel && (
                                    <span className="font-['DM_Mono',monospace] text-[10px] tracking-[0.05em] capitalize text-primary px-1.5 py-px rounded bg-primary/10 border border-primary/25">
                                        {roleLabel}
                                    </span>
                                )}
                            </div>
                        )}

                        <ChevronDown
                            size={13}
                            className={`text-muted-foreground transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`}
                        />
                    </button>

                    {/* Dropdown */}
                    {showProfile && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="
                                absolute top-12 right-0 w-56 rounded-xl overflow-hidden z-50
                                bg-popover dark:bg-[#0f1117]
                                border border-border dark:border-primary/20
                                shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]
                                dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)]
                            "
                        >
                            {/* User info */}
                            <div className="px-4 py-3 border-b border-border">
                                <p className="text-sm font-semibold capitalize text-foreground">{user?.name}</p>
                                <p className="font-['DM_Mono',monospace] text-xs mt-0.5 truncate text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>

                            {/* Links */}
                            <div className="p-2 space-y-0.5">
                                <Link
                                    href={profile.index().url}
                                    className="flex items-center gap-2.5 text-[13px] px-3 py-2 rounded-md text-foreground transition-all duration-150 hover:bg-accent hover:pl-4"
                                >
                                    <User size={14} className="text-muted-foreground shrink-0" />
                                    <span>My Profile</span>
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="p-2 border-t border-border">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2.5 text-[13px] px-3 py-2 rounded-md w-full text-destructive transition-all duration-150 hover:bg-destructive/10"
                                >
                                    <LogOut size={14} className="shrink-0" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile hamburger toggle */}
                <button
                    type="button"
                    onClick={() => setShowMobileNav(true)}
                    className="inline-flex md:hidden items-center justify-center w-8 h-8 rounded-lg text-muted-foreground transition-all hover:bg-accent"
                >
                    <AlignJustify size={18} />
                </button>

            </div>
        </>
    );
}