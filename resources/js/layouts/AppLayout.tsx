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

export default function AppLayout({
    SideNavigation,
    title,
    sub,
    live,
    actions,
    children,
}: Props) {
    return (
        <section
            className="
                font-['Syne',sans-serif]
                w-full
                h-screen
                relative
                overflow-x-hidden
                grid
                grid-cols-1
                md:grid-cols-[240px_minmax(0,1fr)]
            "
        >
            {/* Sidebar */}
            <aside
                className="
                    hidden md:flex
                    flex-col
                    h-screen
                    sticky
                    top-0
                    left-0
                    z-50
                    overflow-hidden
                    relative

                    bg-gradient-to-b
                    from-sidebar
                    to-[color-mix(in_oklch,var(--sidebar)_96%,black)]

                    border-r
                    border-sidebar-border

                    after:absolute
                    after:top-0
                    after:right-0
                    after:bottom-0
                    after:w-px
                    after:bg-gradient-to-b
                    after:from-transparent
                    after:via-primary/35
                    after:to-transparent

                    dark:after:opacity-100
                    after:opacity-0
                "
            >
                {/* Brand */}
                <div className="flex items-center gap-3 px-5 h-16 flex-shrink-0 bg-gradient-to-r from-primary/6 to-transparent">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                        <img
                            src={logo}
                            alt="Logo"
                            className="w-8 h-8 object-contain"
                        />
                    </div>

                    <div>
                        <p className="text-sm font-bold leading-tight text-foreground">
                            Backend Report
                        </p>

                        <p className="font-['DM_Mono',monospace] text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
                            INEC Monitor
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4">
                    <SideNavigation />
                </div>

                {/* Footer */}
                <div className="border-t border-sidebar-border px-5 py-3 flex-shrink-0">
                    <p className="text-center font-['DM_Mono',monospace] text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
                        v2.0.0 — Secure Session
                    </p>
                </div>
            </aside>

            {/* Main */}
            <main
                className="
                    min-w-0
                    w-full
                    h-screen
                    overflow-y-auto
                    overflow-x-hidden

                    bg-gradient-to-b
                    from-gray-50
                    to-gray-100

                    dark:bg-none
                    dark:[background:radial-gradient(circle_at_20%_10%,rgba(34,197,94,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(34,197,94,0.05),transparent_35%),linear-gradient(180deg,#0b0f14_0%,#0f141b_100%)]
                    dark:[background-attachment:fixed]
                "
            >
                {/* Header */}
                <header
                    className="
                        sticky
                        top-0
                        z-40
                        h-16
                        w-full

                        flex
                        items-center
                        justify-end

                        px-5

                        backdrop-blur-[16px]

                        bg-gradient-to-r
                        from-white/95
                        to-white/85

                        border-b
                        border-border

                        dark:from-[#0a0d12]/95
                        dark:to-[#0a0d12]/85
                        dark:border-primary/8
                    "
                >
                    <HeaderNavigation />
                </header>

                {/* Content */}
                <div className="min-w-0 w-full px-5 py-5 space-y-6">
                    <SectionHeader
                        title={title}
                        sub={sub}
                        live={live}
                        actions={actions}
                    />

                    {children}
                </div>
            </main>
        </section>
    );
}