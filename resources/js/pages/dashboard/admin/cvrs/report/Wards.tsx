import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import cvrsReport from "@/routes/admin/cvrs-report";
import { LayoutGrid } from "lucide-react";
import BlockList from "./components/BlockList";

interface Row {
    id: string;
    name: string;
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

export default function Wards({ rows, parent }: Props) {
    return (
        <>
            <Head title={`CVR Report — ${parent.name} Wards`} />
            <AppLayout
                SideNavigation={AdminSidebar}
                title={parent.name}
                sub="Ward-level CVR summary"
                live
                actions={
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 rounded-lg text-sm font-semibold font-['Syne',sans-serif]
                            border border-border bg-transparent text-foreground hover:bg-muted transition-colors"
                    >
                        ← Back to LGAs
                    </button>
                }
            >
                <BlockList
                    rows={rows}
                    columns={[
                        { key: "pus_count", label: "PUs" },
                    ]}
                    detailHref={(row) => cvrsReport.pus(row.id).url}
                    emptyMessage="No wards found for this LGA."
                    icon={LayoutGrid}
                    summaryKey="total_cvrs"
                    summaryLabel="CVRs"
                />
            </AppLayout>
        </>
    );
}