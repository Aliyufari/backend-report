import type { JSX, ReactNode } from "react";
import logo from "@/assets/images/logo.png";
import HeaderNavigation from "@/components/navigations/HeaderNavigation";
import { SectionHeader } from "@/components/ui/dashboard/SectionHeader";

type Props = {
    SideNavigation: JSX.ElementType;
    title: string;
    sub?: string;
    live?: boolean;
    actions?: ReactNode;
    children: ReactNode;
};

export default function AppLayout({ SideNavigation, title, sub, live, actions, children }: Props) {
    return (
        <>
            <style>{`
                @import url('https://fonts.bunny.net/css?family=dm-mono:400,500|syne:600,700');
                .dashboard-layout { font-family: 'Syne', sans-serif; }

                .sidebar {
                    background: linear-gradient(
                        180deg,
                        var(--sidebar),
                        color-mix(in oklch, var(--sidebar) 96%, black)
                    );
                    border-right: 1px solid var(--sidebar-border);
                }

                .sidebar-brand {
                    display: flex;
                    align-items: center;
                    background: linear-gradient(
                        to right,
                        rgba(34,197,94,0.06),
                        transparent
                    );
                }

                .main-area {
                    background: linear-gradient(
                        180deg,
                        #f9fafb 0%,
                        #f3f4f6 100%
                    );
                }

                .top-bar {
                    background: linear-gradient(
                        to right,
                        rgba(255,255,255,0.95),
                        rgba(255,255,255,0.85)
                    );
                    border-bottom: 1px solid var(--border);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                }

                .dark .top-bar {
                    background: linear-gradient(
                        to right,
                        rgba(10,13,18,0.95),
                        rgba(10,13,18,0.85)
                    );
                    border-bottom: 1px solid rgba(34,197,94,0.08);
                }

                .dark .sidebar::after {
                    content: '';
                    position: absolute;
                    top: 0; right: 0; bottom: 0;
                    width: 1px;
                    background: linear-gradient(
                        to bottom,
                        transparent,
                        rgba(34,197,94,0.35) 30%,
                        rgba(34,197,94,0.35) 70%,
                        transparent
                    );
                }

                .dark .main-area {
                    background:
                        radial-gradient(circle at 20% 10%, rgba(34,197,94,0.08), transparent 40%),
                        radial-gradient(circle at 80% 0%, rgba(34,197,94,0.05), transparent 35%),
                        linear-gradient(180deg, #0b0f14 0%, #0f141b 100%);
                    background-attachment: fixed;
                }

                .app-name {
                    font-family: 'DM Mono', monospace;
                    font-size: 10px;
                    letter-spacing: 0.12em;
                    color: var(--muted-foreground);
                    text-transform: uppercase;
                }

                .sidebar-footer {
                    border-top: 1px solid var(--sidebar-border);
                }

                .content-surface {
                    background: rgba(255,255,255,0.75);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 20px;
                }

                .dark .content-surface {
                    background: rgba(17,24,39,0.6);
                    border: 1px solid rgba(34,197,94,0.08);
                    backdrop-filter: blur(10px);
                }
            `}</style>

            <section className="dashboard-layout w-full h-screen relative grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] text-sm">
                {/* Sidebar */}
                <aside className="sidebar hidden md:flex flex-col h-screen sticky top-0 left-0 z-50 overflow-y-auto">
                    <div className="sidebar-brand flex items-center gap-3 px-5 h-16">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <p className="text-foreground text-sm font-bold leading-tight">Backend Report</p>
                            <p className="app-name">INEC Monitor</p>
                        </div>
                    </div>

                    <div className="flex-1 px-3 pb-4">
                        <SideNavigation />
                    </div>

                    <div className="sidebar-footer px-5 py-3">
                        <p className="app-name text-center">v2.0.0 — Secure Session</p>
                    </div>
                </aside>

                {/* Main */}
                <main className="main-area w-full h-screen overflow-y-auto">
                    <header className="top-bar w-full h-16 flex items-center justify-end px-5 sticky top-0 z-40">
                        <HeaderNavigation />
                    </header>
                    <div className="px-5 py-5 space-y-6">
                        <SectionHeader title={title} sub={sub} live={live} actions={actions} />
                        {children}
                    </div>
                </main>
            </section>
        </>
    );
}