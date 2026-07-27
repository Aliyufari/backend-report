import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import accreditations from "@/routes/admin/accreditations";
import SummaryCards from "./components/SummaryCards";
import { useMemo } from "react";
import BlockList from "./components/BlockList";
import { Layers } from "lucide-react";

interface Row {
    id: string;
    name: string;
    lgas_count: number;
    wards_count: number;
    pus_count: number;
    accredited_total: number;
    submitted_pus: number;
    pending_pus: number;
    verified: number;
    pending: number;
    flagged: number;
    submission_percentage: number;
    [key: string]: any;
}

interface Props {
    rows: Row[];
    parent: { id: string; name: string };
    electionId: string | null;
}

export default function Zones({ rows, parent, electionId }: Props) {
    const handleBack = () => {
        router.get(accreditations.index().url, electionId ? { election_id: electionId } : {});
    };

    const stateStats = useMemo(() => {
        const totals = rows.reduce(
            (acc, row) => ({
                verified:      acc.verified + row.verified,
                pending:       acc.pending + row.pending,
                flagged:       acc.flagged + row.flagged,
                accredited:    acc.accredited + row.accredited_total,
                submitted_pus: acc.submitted_pus + row.submitted_pus,
                total_pus:     acc.total_pus + row.pus_count,
            }),
            { verified: 0, pending: 0, flagged: 0, accredited: 0, submitted_pus: 0, total_pus: 0 }
        );

        return {
            verified: totals.verified,
            pending: totals.pending,
            flagged: totals.flagged,
            accredited_total: totals.accredited,
            submission_percentage: totals.total_pus > 0
                ? Math.round((totals.submitted_pus / totals.total_pus) * 1000) / 10
                : 0,
        };
    }, [rows]);

    return (
        <>
            <Head title={`Accreditations — ${parent.name} Zones`} />
            <AppLayout
                SideNavigation={AdminSidebar}
                title={parent.name}
                sub="Zone-level accreditation summary"
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
                    detailHref={(row) =>
                        `${accreditations.lgas(row.id).url}${electionId ? `?election_id=${electionId}` : ""}`
                    }
                    emptyMessage="No zones found for this state."
                    icon={Layers}
                />
            </AppLayout>
        </>
    );
}