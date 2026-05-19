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
        <section className="
            font-['Syne',sans-serif] w-full h-screen relative
            grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] text-sm
        ">
            {/* Sidebar */}
            <aside className="
                hidden md:flex flex-col h-screen sticky top-0 left-0 z-50 overflow-y-auto
                relative
                bg-gradient-to-b from-sidebar to-[color-mix(in_oklch,var(--sidebar)_96%,black)]
                border-r border-sidebar-border
                after:absolute after:top-0 after:right-0 after:bottom-0 after:w-px
                after:bg-gradient-to-b after:from-transparent after:via-primary/35 after:to-transparent
                dark:after:opacity-100 after:opacity-0
            ">
                {/* Brand */}
                <div className="flex items-center gap-3 px-5 h-16 bg-gradient-to-r from-primary/6 to-transparent flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                        <p className="text-foreground text-sm font-bold leading-tight">Backend Report</p>
                        <p className="font-['DM_Mono',monospace] text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
                            INEC Monitor
                        </p>
                    </div>
                </div>

                {/* Nav */}
                <div className="flex-1 px-3 pb-4 overflow-y-auto">
                    <SideNavigation />
                </div>

                {/* Footer */}
                <div className="border-t border-sidebar-border px-5 py-3">
                    <p className="font-['DM_Mono',monospace] text-[10px] tracking-[0.12em] uppercase text-muted-foreground text-center">
                        v2.0.0 — Secure Session
                    </p>
                </div>
            </aside>

            {/* Main */}
            <main className="
                w-full h-screen overflow-y-auto
                bg-gradient-to-b from-gray-50 to-gray-100
                dark:bg-none
                dark:[background:radial-gradient(circle_at_20%_10%,rgba(34,197,94,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(34,197,94,0.05),transparent_35%),linear-gradient(180deg,#0b0f14_0%,#0f141b_100%)]
                dark:[background-attachment:fixed]
            ">
                {/* Top bar */}
                <header className="
                    w-full h-16 flex items-center justify-end px-5 sticky top-0 z-40
                    bg-gradient-to-r from-white/95 to-white/85
                    border-b border-border backdrop-blur-[16px]
                    dark:from-[#0a0d12]/95 dark:to-[#0a0d12]/85
                    dark:border-primary/8
                ">
                    <HeaderNavigation />
                </header>

                <div className="px-5 py-5 space-y-6">
                    <SectionHeader title={title} sub={sub} live={live} actions={actions} />
                    {children}
                </div>
            </main>
        </section>
    );
}