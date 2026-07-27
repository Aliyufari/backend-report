import { Link, usePage } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
import type { JSX } from "react";

import { dashboard } from "@/routes/admin";

type Wayfinder = ReturnType<typeof dashboard>;

export interface NavLinkItem {
    name: string;
    path: Wayfinder;
    icon: JSX.Element;

    /**
     * Match only the exact URL.
     * Defaults to false (startsWith).
     */
    exact?: boolean;
}

interface Props {
    primary?: NavLinkItem[];
    secondary?: NavLinkItem[];
    secondaryLabel?: string;
}

export default function SideNavList({
    primary = [],
    secondary = [],
    secondaryLabel = "Administration",
}: Props) {
    const { url } = usePage();

    const isActive = ({ path, exact = false }: NavLinkItem) => {
        if (exact) {
            return url === path.url;
        }

        return (
            url === path.url ||
            url.startsWith(path.url + "/") ||
            url.startsWith(path.url + "?")
        );
    };

    const renderLink = ({ name, path, icon, exact }: NavLinkItem) => (
        <Link
            key={name}
            href={path}
            className={`nav-link ${isActive({ name, path, icon, exact }) ? "active" : ""}`}
        >
            <span className="nav-icon">{icon}</span>
            <span>{name}</span>
            <ChevronRight size={12} className="nav-chevron" />
        </Link>
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.bunny.net/css?family=dm-mono:400,500|syne:600,700');

                .sidenav {
                    font-family: 'Syne', sans-serif;
                }

                .nav-section-label {
                    font-family: 'DM Mono', monospace;
                    font-size: 10px;
                    letter-spacing: .15em;
                    color: var(--muted-foreground);
                    text-transform: uppercase;
                    padding: 0 10px;
                    margin: 8px 0 4px;
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
                    opacity: .6;
                    transition: .18s ease;
                    margin-bottom: 2px;
                    border: 1px solid transparent;
                    text-decoration: none;
                    overflow: hidden;
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

                .nav-link.active::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 20%;
                    bottom: 20%;
                    width: 2.5px;
                    border-radius: 0 2px 2px 0;
                    background: var(--primary);
                }

                .dark .nav-link.active {
                    background: rgba(34,197,94,.08);
                    border-color: rgba(34,197,94,.15);
                    color: #22c55e;
                }

                .dark .nav-link.active::before {
                    box-shadow: 0 0 8px rgba(34,197,94,.6);
                }

                .nav-icon {
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    color: var(--muted-foreground);
                    transition: color .18s ease;
                }

                .nav-link:hover .nav-icon,
                .nav-link.active .nav-icon {
                    color: var(--primary);
                }

                .dark .nav-link.active .nav-icon {
                    color: #22c55e;
                    filter: drop-shadow(0 0 6px rgba(34,197,94,.5));
                }

                .nav-chevron {
                    margin-left: auto;
                    opacity: 0;
                    transform: translateX(-4px);
                    transition: .18s ease;
                    color: var(--primary);
                    flex-shrink: 0;
                }

                .nav-link:hover .nav-chevron,
                .nav-link.active .nav-chevron {
                    opacity: 1;
                    transform: translateX(0);
                }

                .nav-divider {
                    height: 1px;
                    margin: 8px 10px;
                    background: color-mix(in oklch, var(--border) 60%, transparent);
                }
            `}</style>

            <div className="sidenav space-y-0.5">
                <p className="nav-section-label">Navigation</p>

                {primary.map(renderLink)}

                {secondary.length > 0 && (
                    <>
                        <div className="nav-divider" />

                        <p className="nav-section-label">
                            {secondaryLabel}
                        </p>

                        {secondary.map(renderLink)}
                    </>
                )}
            </div>
        </>
    );
}