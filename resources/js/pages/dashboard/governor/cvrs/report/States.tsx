import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import GovernorSidebar from "@/components/sidebar/GovernorSidebar";
import cvrsReport from "@/routes/governor/cvrs-report";
import { House } from "lucide-react";
import BlockList from "../components/BlockList";

interface Row {
    id: string;
    name: string;
    zones_count: number;
    lgas_count: number;
    wards_count: number;
    pus_count: number;
    total_cvrs: number;
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
}

export default function States({ rows }: Props) {
    return (
        <>
            <Head title="CVR Report" />
            <AppLayout
                SideNavigation={GovernorSidebar}
                title="CVR Report"
                sub="Nationwide continuous voter registration summary"
                live
            >
                <BlockList
                    rows={rows}
                    columns={[
                        { key: "zones_count", label: "Zones" },
                        { key: "lgas_count", label: "LGAs" },
                        { key: "wards_count", label: "Wards" },
                        { key: "pus_count", label: "PUs" },
                    ]}
                    detailHref={(row) => cvrsReport.zones(row.id).url}
                    emptyMessage="No states found."
                    icon={House}
                    summaryKey="total_cvrs"
                    summaryLabel="CVRs"
                />
            </AppLayout>
        </>
    );
}