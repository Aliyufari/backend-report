import { useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import cvrsReport from "@/routes/admin/cvrs-report";
import { Layers } from "lucide-react";
import SummaryCards from "./components/SummaryCards";
import BlockList from "./components/BlockList";

interface Row {
    id: string;
    name: string;
    lgas_count: number;
    wards_count: number;
    pus_count: number;
    pending: number;
    approved: number;
    rejected: number;
    pus_with_cvr: number;
    pus_without_cvr: number;
    coverage_percentage: number;
    [key: string]: any;
}

interface Props {
    rows: Row[];
    parent: { id: string; name: string };
}

export default function Zones({ rows, parent }: Props) {
    const handleBack = () => router.get(cvrsReport.index().url);

    const stateStats = useMemo(() => {
        const totals = rows.reduce(
            (acc, row) => ({
                pending:      acc.pending + row.pending,
                approved:     acc.approved + row.approved,
                rejected:     acc.rejected + row.rejected,
                pus_with_cvr: acc.pus_with_cvr + row.pus_with_cvr,
                total_pus:    acc.total_pus + row.pus_count,
            }),
            { pending: 0, approved: 0, rejected: 0, pus_with_cvr: 0, total_pus: 0 }
        );

        return {
            pending: totals.pending,
            approved: totals.approved,
            rejected: totals.rejected,
            pus_with_cvr: totals.pus_with_cvr,
            pus_without_cvr: Math.max(totals.total_pus - totals.pus_with_cvr, 0),
            coverage_percentage: totals.total_pus > 0
                ? Math.round((totals.pus_with_cvr / totals.total_pus) * 1000) / 10
                : 0,
        };
    }, [rows]);

    return (
        <>
            <Head title={`CVR Report — ${parent.name} Zones`} />
            <AppLayout
                SideNavigation={AdminSidebar}
                title={parent.name}
                sub="Zone-level CVR summary"
                live
                actions={
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 rounded-lg text-sm font-semibold font-['Syne',sans-serif]
                            border border-border bg-transparent text-foreground hover:bg-muted transition-colors"
                    >
                        ← Back to States
                    </button>
                }
            >
                <SummaryCards stats={stateStats} />

                <BlockList
                    rows={rows}
                    columns={[
                        { key: "lgas_count", label: "LGAs" },
                        { key: "wards_count", label: "Wards" },
                        { key: "pus_count", label: "PUs" },
                    ]}
                    detailHref={(row) => cvrsReport.lgas(row.id).url}
                    emptyMessage="No zones found for this state."
                    icon={Layers}
                    summaryKey="total_cvrs"
                    summaryLabel="CVRs"
                />
            </AppLayout>
        </>
    );
}