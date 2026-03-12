import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    CalendarClock,
    MapPin,
    UserCog,
    Vote,
    ShieldCheck,
    ChevronRight,
    CloudUpload,
} from "lucide-react";
import useRole from "@/hooks/auth/useRole";

const AdminSideNavLinks = () => {
    const { url } = usePage();
    const role = useRole();

    const links = [
        {
            name: "Dashboard",
            path: "/dashboard",
            compare: url === "/dashboard",
            icon: <LayoutDashboard size={16} />,
            excludes: [] as string[],
        },
        {
            name: "Election Schedule",
            path: "/elections/schedule",
            compare: url.startsWith("/elections/schedule"),
            icon: <CalendarClock size={16} />,
            excludes: [] as string[],
        },
        {
            name: "LGA SPOs",
            path: "/lgas/spos",
            compare: url.startsWith("/lgas/spos"),
            icon: <MapPin size={16} />,
            excludes: [] as string[],
        },
        {
            name: "Upload CSV",
            path: "/users",
            compare: url.startsWith("/users"),
            icon: <CloudUpload size={16} />,
            excludes: ["chairman", "hakimi"],
        },
        {
            name: "Manage Users",
            path: "/users",
            compare: url.startsWith("/users"),
            icon: <UserCog size={16} />,
            excludes: ["chairman", "hakimi"],
        },
        {
            name: "Manage Elections",
            path: "/elections",
            compare: url.startsWith("/elections") && !url.startsWith("/elections/schedule") && !url.startsWith("/elections/readiness"),
            icon: <Vote size={16} />,
            excludes: ["chairman", "hakimi"],
        },
        {
            name: "Election Readiness",
            path: "/elections/readiness",
            compare: url.startsWith("/elections/readiness"),
            icon: <ShieldCheck size={16} />,
            excludes: ["chairman", "hakimi"],
        },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.bunny.net/css?family=dm-mono:400,500|syne:600,700');
                .sidenav { font-family: 'Syne', sans-serif; }

                .nav-section-label {
                    font-family: 'DM Mono', monospace;
                    font-size: 10px;
                    letter-spacing: 0.15em;
                    color: var(--muted-foreground);
                    text-transform: uppercase;
                    padding: 0 10px;
                    margin-bottom: 4px;
                    margin-top: 8px;
                }

                .nav-link {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 9px 10px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--sidebar-foreground);
                    opacity: 0.6;
                    transition: all 0.18s ease;
                    margin-bottom: 2px;
                    overflow: hidden;
                    border: 1px solid transparent;
                    text-decoration: none;
                }

                .nav-link:hover {
                    opacity: 1;
                    background: var(--sidebar-accent);
                    color: var(--sidebar-accent-foreground);
                }

                .nav-link.active {
                    opacity: 1;
                    color: var(--primary);
                    background: color-mix(in oklch, var(--primary) 10%, transparent);
                    border-color: color-mix(in oklch, var(--primary) 20%, transparent);
                }

                .nav-link.active .nav-icon {
                    color: var(--primary);
                }

                /* Dark mode overrides */
                .dark .nav-link.active {
                    background: rgba(34,197,94,0.08);
                    border-color: rgba(34,197,94,0.15);
                    color: #22c55e;
                }

                .dark .nav-link.active .nav-icon {
                    color: #22c55e;
                    filter: drop-shadow(0 0 6px rgba(34,197,94,0.5));
                }

                .dark .nav-link:hover {
                    background: rgba(255,255,255,0.04);
                    color: #e4e4e7;
                    opacity: 1;
                }

                .nav-link .nav-chevron {
                    margin-left: auto;
                    opacity: 0;
                    transform: translateX(-4px);
                    transition: all 0.18s ease;
                    color: var(--primary);
                    flex-shrink: 0;
                }

                .nav-link.active .nav-chevron,
                .nav-link:hover .nav-chevron {
                    opacity: 1;
                    transform: translateX(0);
                }

                .nav-link .nav-icon {
                    color: var(--muted-foreground);
                    transition: color 0.18s ease;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 16px;
                    height: 16px;
                }

                .nav-link:hover .nav-icon {
                    color: var(--sidebar-accent-foreground);
                }

                .nav-link.active::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 20%; bottom: 20%;
                    width: 2.5px;
                    border-radius: 0 2px 2px 0;
                    background: var(--primary);
                }

                .dark .nav-link.active::before {
                    box-shadow: 0 0 8px rgba(34,197,94,0.6);
                }

                .nav-divider {
                    height: 1px;
                    background: color-mix(in oklch, var(--border) 60%, transparent);
                    margin: 8px 10px;
                }
            `}</style>

            <div className="sidenav space-y-0.5">
                <p className="nav-section-label">Navigation</p>

                {/* Always-visible links */}
                {links.slice(0, 3).map((link) =>
                    role && link.excludes.includes(role) ? null : (
                        <Link
                            key={link.name}
                            href={link.path}
                            className={`nav-link ${link.compare ? "active" : ""}`}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            <span>{link.name}</span>
                            <ChevronRight size={12} className="nav-chevron" />
                        </Link>
                    )
                )}

                {/* Divider before admin-only links */}
                {role && !["chairman", "hakimi"].includes(role) && (
                    <>
                        <div className="nav-divider" />
                        <p className="nav-section-label">Administration</p>
                    </>
                )}

                {/* Admin-only links */}
                {links.slice(3).map((link) =>
                    role && link.excludes.includes(role) ? null : (
                        <Link
                            key={link.name}
                            href={link.path}
                            className={`nav-link ${link.compare ? "active" : ""}`}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            <span>{link.name}</span>
                            <ChevronRight size={12} className="nav-chevron" />
                        </Link>
                    )
                )}
            </div>
        </>
    );
};

export default AdminSideNavLinks;