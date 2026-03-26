import { AlignJustify, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import Spinner from "@/pages/components/Spinner";
import MobileNavigation from "@/components/navigations/MobileNavigation";

interface AuthUser {
    id: number;
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
    [key: string]: unknown;
}

export default function HeaderNavigation() {
    const [showProfile, setShowProfile] = useState(false);
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
            <style>{`
                @import url('https://fonts.bunny.net/css?family=dm-mono:400,500|syne:600,700');
                .header-nav { font-family: 'Syne', sans-serif; }
                .header-mono { font-family: 'DM Mono', monospace; }

                .role-badge {
                    font-family: 'DM Mono', monospace;
                    font-size: 10px;
                    letter-spacing: 0.05em;
                    background: color-mix(in oklch, var(--primary) 12%, transparent);
                    color: var(--primary);
                    border: 1px solid color-mix(in oklch, var(--primary) 25%, transparent);
                    padding: 1px 6px;
                    border-radius: 4px;
                    text-transform: capitalize;
                }

                .dark .role-badge {
                    background: rgba(34,197,94,0.12);
                    color: #4ade80;
                    border-color: rgba(34,197,94,0.25);
                }

                .avatar-box {
                    width: 32px; height: 32px;
                    border-radius: 8px;
                    background: color-mix(in oklch, var(--primary) 10%, transparent);
                    border: 1px solid color-mix(in oklch, var(--primary) 25%, transparent);
                    display: flex; align-items: center; justify-content: center;
                    color: var(--primary);
                    font-family: 'DM Mono', monospace;
                    font-size: 13px;
                    font-weight: 700;
                    transition: all 0.2s ease;
                }

                .avatar-box.active {
                    box-shadow: 0 0 0 2px color-mix(in oklch, var(--primary) 40%, transparent),
                                0 0 12px color-mix(in oklch, var(--primary) 15%, transparent);
                }

                .dark .avatar-box {
                    background: rgba(34,197,94,0.1);
                    border-color: rgba(34,197,94,0.25);
                    color: #4ade80;
                }

                .profile-trigger:hover {
                    background: var(--accent);
                }

                .dark .profile-trigger:hover {
                    background: rgba(255,255,255,0.05);
                }

                .profile-dropdown {
                    background: var(--popover);
                    border: 1px solid var(--border);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
                }

                .dark .profile-dropdown {
                    background: #0f1117;
                    border-color: rgba(34,197,94,0.2);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                }

                .dropdown-header {
                    border-bottom: 1px solid var(--border);
                }

                .dark .dropdown-header { border-color: rgba(255,255,255,0.05); }

                .dropdown-item {
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    padding: 8px 12px;
                    border-radius: 6px;
                    color: var(--foreground);
                    transition: all 0.15s ease;
                    cursor: pointer;
                    width: 100%;
                }

                .dropdown-item:hover {
                    background: var(--accent);
                    padding-left: 16px;
                }

                .dark .dropdown-item { color: #d4d4d8; }
                .dark .dropdown-item:hover { background: rgba(34,197,94,0.06); }

                .dropdown-item::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 15%; bottom: 15%;
                    width: 2px;
                    background: var(--primary);
                    border-radius: 0 2px 2px 0;
                    transform: scaleY(0);
                    transition: transform 0.15s ease;
                }
                .dropdown-item:hover::before { transform: scaleY(1); }

                .dropdown-divider { border-top: 1px solid var(--border); }
                .dark .dropdown-divider { border-color: rgba(255,255,255,0.05); }

                .logout-btn {
                    display: flex; align-items: center; gap: 10px;
                    font-size: 13px; padding: 8px 12px; border-radius: 6px;
                    color: var(--destructive);
                    transition: all 0.15s ease;
                    cursor: pointer; width: 100%;
                }
                .logout-btn:hover { background: color-mix(in oklch, var(--destructive) 10%, transparent); }

                @keyframes pulse-primary {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.35; }
                }
                .status-dot { animation: pulse-primary 2.5s ease-in-out infinite; }
            `}</style>

            <MobileNavigation
                showMobile={showMobileNav}
                onClose={() => setShowMobileNav(false)}
            />

            <div className="header-nav flex items-center gap-3">
                {/* Live indicator */}
                <div className="hidden md:flex items-center gap-1.5 header-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <span className="status-dot w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--primary)' }} />
                    <span>LIVE</span>
                </div>

                <div className="w-px h-5 hidden md:block" style={{ background: 'var(--border)' }} />

                {/* Profile */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowProfile((v) => !v); }}
                        className="profile-trigger flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-200"
                    >
                        <div className={`avatar-box ${showProfile ? "active" : ""}`}>
                            {!user ? (
                                <Spinner size={14} color="var(--primary)" />
                            ) : (
                                user.name?.charAt(0).toUpperCase()
                            )}
                        </div>

                        {user?.id ? (
                            <div className="hidden md:flex flex-col items-start gap-0.5">
                                <span className="text-xs font-semibold leading-none capitalize" style={{ color: 'var(--foreground)' }}>
                                    {user.name}
                                </span>
                                {roleLabel && <span className="role-badge">{roleLabel}</span>}
                            </div>
                        ) : null}

                        <ChevronDown
                            size={13}
                            className={`transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`}
                            style={{ color: 'var(--muted-foreground)' }}
                        />
                    </button>

                    {showProfile && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="profile-dropdown absolute top-12 right-0 w-56 rounded-xl overflow-hidden z-50"
                        >
                            {/* User info */}
                            <div className="dropdown-header px-4 py-3">
                                <p className="text-sm font-semibold capitalize" style={{ color: 'var(--foreground)' }}>{user?.name}</p>
                                <p className="header-mono text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>{user?.email}</p>
                            </div>

                            {/* Links */}
                            <div className="p-2 space-y-0.5">
                                <Link href="/admin/profile" className="dropdown-item">
                                    <User size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                                    <span>My Profile</span>
                                </Link>
                                <Link href="/dashboard/settings" className="dropdown-item">
                                    <Settings size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                                    <span>Settings</span>
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="p-2 dropdown-divider">
                                <button onClick={handleLogout} className="logout-btn">
                                    <LogOut size={14} style={{ flexShrink: 0 }} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    type="button"
                    onClick={() => setShowMobileNav(true)}
                    className="inline-flex md:hidden items-center justify-center w-8 h-8 rounded-lg transition-all"
                    style={{ color: 'var(--muted-foreground)' }}
                >
                    <AlignJustify size={18} />
                </button>
            </div>
        </>
    );
}