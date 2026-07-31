import { useEffect, type JSX, useMemo } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { LogOut, User } from "lucide-react";

import AdminSidebar from "../sidebar/AdminSidebar";
import GovernorSidebar from "../sidebar/GovernorSidebar";
import CoordinatorSidebar from "../sidebar/CoordinatorSidebar";

import useRole from "@/hooks/auth/useRole";
import type { Roles } from "@/types";

import logo from "@/assets/images/logo.png";

import * as adminProfile from "@/routes/admin/profile";
import * as governorProfile from "@/routes/governor/profile";
import * as coordinatorProfile from "@/routes/coordinator/profile";

interface MobileProps {
    showMobile: boolean;
    onClose: () => void;
}

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

export default function MobileNavigation({
    showMobile,
    onClose,
}: MobileProps) {
    const role = useRole();

    const { props } = usePage<PageProps>();

    const user = props.auth.user;

    const navLinks: Record<Roles, JSX.Element> = {
        super_admin: <AdminSidebar />,
        admin: <AdminSidebar />,
        governor: <GovernorSidebar />,
        state_coordinator: <CoordinatorSidebar />,
        zonal_coordinator: <CoordinatorSidebar />,
        lga_coordinator: <CoordinatorSidebar />,
        ward_coordinator: <CoordinatorSidebar />,
    };

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

    useEffect(() => {
        const resize = () => onClose();

        window.addEventListener("resize", resize);

        return () => window.removeEventListener("resize", resize);
    }, [onClose]);

    if (!role) {
        return null;
    }

    return (
        <section
            onClick={onClose}
            className={`
                fixed inset-0
                bg-black/40 backdrop-blur-sm
                transition-opacity duration-300 z-50
                ${
                    showMobile
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                }
            `}
        >
            <aside
                onClick={(e) => e.stopPropagation()}
                className={`
                    absolute top-0 right-0
                    w-[280px] max-w-[85vw]
                    h-screen
                    flex flex-col
                    border-l border-sidebar-border
                    bg-gradient-to-b
                    from-sidebar
                    to-[color-mix(in_oklch,var(--sidebar)_96%,black)]
                    transition-transform duration-300
                    ${
                        showMobile
                            ? "translate-x-0"
                            : "translate-x-full"
                    }
                `}
            >
                {/* Logo */}

                <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border bg-gradient-to-r from-primary/6 to-transparent">
                    <img
                        src={logo}
                        alt="Logo"
                        className="w-8 h-8 object-contain"
                    />

                    <div>
                        <p className="font-bold text-sm">
                            Backend Report
                        </p>

                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            INEC Monitor
                        </p>
                    </div>
                </div>

                {/* User */}

                <div className="border-b border-sidebar-border px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-semibold text-primary">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                                {user?.name}
                            </p>

                            <p className="text-xs truncate text-muted-foreground">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}

                <div className="flex-1 overflow-y-auto px-3 py-4">
                    {navLinks[role]}

                    <div className="border-t border-sidebar-border mt-4 pt-4">
                        {profileRoute && (
                            <Link
                                href={profileRoute.url}
                                onClick={onClose}
                                className="nav-link"
                            >
                                <span className="nav-icon">
                                    <User size={16} />
                                </span>

                                <span>My Profile</span>
                            </Link>
                        )}

                        <button
                            onClick={() => {
                                onClose();
                                router.post("/logout");
                            }}
                            className="
                                nav-link
                                w-full
                                text-left
                                text-destructive
                                hover:bg-destructive/10
                            "
                        >
                            <span className="nav-icon">
                                <LogOut size={16} />
                            </span>

                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}

                <div className="border-t border-sidebar-border px-5 py-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-center text-muted-foreground">
                        v2.0.0 — Secure Session
                    </p>
                </div>
            </aside>
        </section>
    );
}