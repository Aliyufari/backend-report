import { AlignJustify, ChevronDown, LogOut, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";

import Spinner from "@/pages/components/Spinner";
import MobileNavigation from "@/components/navigations/MobileNavigation";
import logo from "@/assets/images/logo.png";

import * as adminProfile from "@/routes/admin/profile";
import * as governorProfile from "@/routes/governor/profile";
import * as coordinatorProfile from "@/routes/coordinator/profile";

interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: {
        id: string;
        name: string;
    } | null;
}

interface PageProps {
    auth: {
        user: AuthUser | null;
    };
}

export default function HeaderNavigation() {
    const [showProfile, setShowProfile] = useState(false);
    const [showMobileNav, setShowMobileNav] = useState(false);

    const { props } = usePage<PageProps>();

    const user = props.auth.user;

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

    /**
     * Resolve profile route based on authenticated role.
     */
    const profileRoute = useMemo(() => {
        switch (user?.role?.name) {
            case "super_admin":
            case "admin":
                return adminProfile.index();

            case "governor":
                return governorProfile.index();

            case "state_coordinator":
            case "zonal_coordinator":
            case "lga_coordinator":
            case "ward_coordinator":
                return coordinatorProfile.index();

            default:
                return null;
        }
    }, [user]);

    return (
        <>
            <MobileNavigation
                showMobile={showMobileNav}
                onClose={() => setShowMobileNav(false)}
            />

            <div className="font-['Syne',sans-serif] flex items-center gap-3 w-full md:justify-end">

                {/* Mobile Logo */}
                <div className="flex md:hidden items-center gap-2.5 flex-1">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                        <img
                            src={logo}
                            alt="Logo"
                            className="w-8 h-8 object-contain"
                        />
                    </div>

                    <div className="flex flex-col leading-none gap-[3px]">
                        <p className="text-foreground text-sm font-bold">
                            Backend Report
                        </p>

                        <p className="font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            INEC Monitor
                        </p>
                    </div>
                </div>

                {/* Live */}
                <div className="hidden md:flex items-center gap-1.5 font-['DM_Mono',monospace] text-xs text-muted-foreground">
                    <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>LIVE</span>
                </div>

                <div className="hidden md:block w-px h-5 bg-border" />

                {/* Profile */}
                <div className="relative">

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowProfile(v => !v);
                        }}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-accent transition"
                    >

                        <div
                            className={`
                                w-8 h-8 rounded-lg flex items-center justify-center
                                bg-primary/10 border border-primary/25
                                text-primary font-bold text-[13px]
                                ${showProfile ? "ring-2 ring-primary/40" : ""}
                            `}
                        >
                            {!user
                                ? <Spinner size={14} color="var(--primary)" />
                                : user.name.charAt(0).toUpperCase()}
                        </div>

                        {user && (
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-xs font-semibold capitalize">
                                    {user.name}
                                </span>

                                {roleLabel && (
                                    <span className="font-['DM_Mono',monospace] text-[10px] uppercase px-1.5 py-px rounded bg-primary/10 border border-primary/25 text-primary">
                                        {roleLabel}
                                    </span>
                                )}
                            </div>
                        )}

                        <ChevronDown
                            size={13}
                            className={`transition-transform ${
                                showProfile ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {showProfile && (

                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="
                                absolute top-12 right-0 w-56 rounded-xl overflow-hidden
                                bg-popover border border-border
                                shadow-xl z-50
                            "
                        >

                            <div className="px-4 py-3 border-b border-border">
                                <p className="text-sm font-semibold capitalize">
                                    {user?.name}
                                </p>

                                <p className="text-xs font-['DM_Mono',monospace] truncate text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>

                            <div className="p-2">

                                {profileRoute && (
                                    <Link
                                        href={profileRoute.url}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-accent transition"
                                    >
                                        <User size={14} />
                                        <span>My Profile</span>
                                    </Link>
                                )}

                            </div>

                            <div className="border-t border-border p-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition"
                                >
                                    <LogOut size={14} />
                                    <span>Sign Out</span>
                                </button>
                            </div>

                        </div>

                    )}
                </div>

                {/* Mobile */}
                <button
                    type="button"
                    onClick={() => setShowMobileNav(true)}
                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent"
                >
                    <AlignJustify size={18} />
                </button>

            </div>
        </>
    );
}