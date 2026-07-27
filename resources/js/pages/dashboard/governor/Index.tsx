import { Head } from "@inertiajs/react";
import { Users, MapPin, Cpu, IdCard, Clock } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import GovernorSidebar from "@/components/sidebar/GovernorSidebar";
import { SummaryCards, type CardDef } from "@/components/ui/dashboard/SummaryCard";
import { LGASummary } from "@/components/ui/dashboard/LGASummary";
import { AreaChart } from "@/components/charts/AreaChart";
import { Barchart } from "@/components/charts/Barchart";
import { PieDonut } from "@/components/charts/PieDonut";

interface Stats {
    total_cvrs: number;
    pending_cvrs: number;
    approved_cvrs: number;
    rejected_cvrs: number;
    active_centres: number;
    active_machines: number;
}

interface LgaRow {
    name: string;
    count: number;
}

interface Props {
    stateName?: string | null;
    stats: Stats;
    lgaData: LgaRow[];
}

export default function GovernorDashboard({ stateName, stats, lgaData }: Props) {
    const summaryCards: CardDef[] = [
        {
            label: "CVRs in State",
            value: stats.total_cvrs,
            icon: Users,
            trend: "up",
            trendValue: `${stats.approved_cvrs.toLocaleString()} approved`,
            gradient: "from-emerald-50 to-emerald-100/50 border-emerald-200 text-emerald-700",
        },
        {
            label: "Pending CVRs",
            value: stats.pending_cvrs,
            icon: Clock,
            trend: stats.pending_cvrs > 0 ? "up" : "neutral",
            trendValue: "Awaiting review",
            gradient: "from-amber-50 to-amber-100/50 border-amber-200 text-amber-700",
        },
        {
            label: "Approved CVRs",
            value: stats.approved_cvrs,
            icon: IdCard,
            trend: "up",
            trendValue: `${stats.rejected_cvrs.toLocaleString()} rejected`,
            gradient: "from-purple-50 to-purple-100/50 border-purple-200 text-purple-700",
        },
        {
            label: "Active Centres",
            value: stats.active_centres,
            icon: MapPin,
            trend: "neutral",
            trendValue: "Polling units",
            gradient: "from-blue-50 to-blue-100/50 border-blue-200 text-blue-700",
        },
        {
            label: "Active Machines",
            value: stats.active_machines,
            icon: Cpu,
            trend: "neutral",
            trendValue: "BIVAS across state",
            gradient: "from-rose-50 to-rose-100/50 border-rose-200 text-rose-700",
        },
    ];

    return (
        <>
            <Head title="Governor Dashboard" />
            <AppLayout
                SideNavigation={GovernorSidebar}
                title="Governor's Dashboard"
                sub={`${stateName?.toUpperCase() ?? "YOUR STATE"} · INEC VOTER REGISTRATION MONITOR`}
                live
            >
                <SummaryCards cards={summaryCards} />

                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                    <div className="min-w-0 h-full"><AreaChart /></div>
                    <div className="min-w-0 h-full"><PieDonut /></div>
                </div>

                <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-[320px_1fr]">
                    <div className="min-w-0"><LGASummary data={lgaData} /></div>
                    <div className="min-w-0"><Barchart /></div>
                </div>
            </AppLayout>
        </>
    );
}