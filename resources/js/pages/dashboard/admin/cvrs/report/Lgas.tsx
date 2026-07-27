import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import cvrsReport from "@/routes/admin/cvrs-report";
import { Building2 } from "lucide-react";
import BlockList from "./components/BlockList";

interface Row {
    id: string;
    name: string;
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

export default function Lgas({ rows, parent }: Props) {
    return (
        <>
            <Head title={`CVR Report — ${parent.name} LGAs`} />
            <AppLayout
                SideNavigation={AdminSidebar}
                title={parent.name}
                sub="LGA-level CVR summary"
                live
                actions={
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 rounded-lg text-sm font-semibold font-['Syne',sans-serif]
                            border border-border bg-transparent text-foreground hover:bg-muted transition-colors"
                    >
                        ← Back to Zones
                    </button>
                }
            >
                <BlockList
                    rows={rows}
                    columns={[
                        { key: "wards_count", label: "Wards" },
                        { key: "pus_count", label: "PUs" },
                    ]}
                    detailHref={(row) => cvrsReport.wards(row.id).url}
                    emptyMessage="No LGAs found for this zone."
                    icon={Building2}
                    summaryKey="total_cvrs"
                    summaryLabel="CVRs"
                />
            </AppLayout>
        </>
    );
}