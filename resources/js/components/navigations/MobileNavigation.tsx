import { useEffect, type JSX } from "react";
import AdminSidebar from "../sidebar/AdminSidebar";
import GovernorSidebar from "../sidebar/GovernorSidebar";
import CoordinatorSidebar from "../sidebar/CoordinatorSidebar";
import useRole from "@/hooks/auth/useRole";
import type { Roles } from "@/types";
import logo from "@/assets/images/logo.png";

interface MobileProps {
    showMobile: boolean;
    onClose: () => void;
}

export default function MobileNavigation({ showMobile, onClose }: MobileProps) {
    const role = useRole();

    const navLinks: Record<Roles, JSX.Element> = {
        super_admin: <AdminSidebar />,
        admin: <AdminSidebar />,
        governor: <GovernorSidebar />,
        zonal_coordinator: <CoordinatorSidebar />,
        state_coordinator: <CoordinatorSidebar />,
        lga_coordinator: <CoordinatorSidebar />,
        ward_coordinator: <CoordinatorSidebar />,
    };

    useEffect(() => {
        const onResize = () => onClose();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [onClose]);

    const handleClose = (ev: React.MouseEvent<HTMLElement>) => {
        const target = ev.target as HTMLElement;
        const tag = target.tagName.toLowerCase();
        if (tag === "section" && target.className?.includes("mobile")) return onClose();
        if (["a", "span", "svg", "path"].includes(tag)) return setTimeout(() => onClose(), 200);
    };

    if (!role) return null;

    return (
        <section
            onClick={handleClose}
            className={`
                mobile w-full h-screen fixed top-0 left-0
                bg-black/40 backdrop-blur-sm
                transition-all duration-500 cursor-pointer z-50
                ${showMobile ? "translate-x-0 opacity-100" : "-translate-x-[120vw] opacity-0"}
            `}
        >
            <div className={`
                w-[220px] h-screen flex flex-col
                bg-gradient-to-b from-sidebar to-[color-mix(in_oklch,var(--sidebar)_96%,black)]
                border-r border-sidebar-border
                absolute top-0 right-0 cursor-default
                transition-all delay-300 duration-500
                ${showMobile ? "opacity-100" : "opacity-0"}
            `}>
                {/* Brand — mirrors AppLayout sidebar exactly */}
                <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border bg-gradient-to-r from-primary/6 to-transparent flex-shrink-0">
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

                {/* Nav links */}
                <div className="flex-1 overflow-y-auto px-3 py-4">
                    {navLinks[role]}
                </div>

                {/* Footer — mirrors AppLayout sidebar exactly */}
                <div className="border-t border-sidebar-border px-5 py-3">
                    <p className="font-['DM_Mono',monospace] text-[10px] tracking-[0.12em] uppercase text-muted-foreground text-center">
                        v2.0.0 — Secure Session
                    </p>
                </div>
            </div>
        </section>
    );
}