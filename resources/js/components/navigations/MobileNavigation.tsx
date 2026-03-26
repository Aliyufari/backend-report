import { useEffect, type JSX } from "react";
import AdminSidebar from "../sidebar/AdminSidebar";
// import AdminSideNavLinks from "../applicant/ApplicantSideNavLinks";
import useRole from "@/hooks/auth/useRole";
import type { Roles } from "@/types";

interface MobileProps {
    showMobile: boolean;
    onClose: () => void;
}

export default function MobileNavigation({ showMobile, onClose }: MobileProps) {
    const role = useRole();

    const navLinks: Record<Roles, JSX.Element> = {
        super_admin: <AdminSidebar />,
        admin: <AdminSidebar />,
        governor: <AdminSidebar />,
        // state_coordinator: <ApplicantSideNavLinks />,
        // zonal_coordinator: <ApplicantSideNavLinks />,
        // lga_coordinator: <ApplicantSideNavLinks />,
        // ward_coordinator: <ApplicantSideNavLinks />,
    };

    // Close on resize to desktop
    useEffect(() => {
        const onResize = () => onClose();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [onClose]);

    const handleClose = (ev: React.MouseEvent<HTMLElement>) => {
        const target = ev.target as HTMLElement;
        const tag = target.tagName.toLowerCase();

        // Clicked on backdrop
        if (tag === "section" && target.className?.includes("mobile")) {
            return onClose();
        }

        // Clicked on a nav link or its children
        if (["a", "span", "svg", "path"].includes(tag)) {
            return setTimeout(() => onClose(), 200);
        }
    };

    if (!role) return null;

    return (
        <section
            onClick={handleClose}
            className={`mobile w-full h-screen fixed top-0 left-0 bg-[#33333399] transition-all duration-500 ${
                showMobile ? "translate-x-0 opacity-100" : "-translate-x-[120vw] opacity-0"
            } cursor-pointer z-50`}
        >
            <div
                className={`w-[200px] h-screen bg-white transition-all delay-300 duration-500 ${
                    showMobile ? "opacity-100" : "opacity-0"
                } absolute top-0 right-0 cursor-default p-4`}
            >
                {navLinks[role]}
            </div>
        </section>
    );
}