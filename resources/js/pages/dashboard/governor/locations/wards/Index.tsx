import { usePage, Head } from "@inertiajs/react";
import { LayoutGrid } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import GovernorSidebar from "@/components/sidebar/GovernorSidebar";
import DataTable from "@/components/ui/DataTable";
import StateLocationStats from "@/components/locations/StateLocationStats";

interface Lga { id: string; name: string; }
interface Ward {
    id: string;
    name: string;
    lga: Lga;
    pus_count: number;
    created_at: string;
}

interface Statistics { zones: number; lgas: number; wards: number; pus: number; }

interface PageProps {
    wards: { data: Ward[]; links: unknown[]; meta: Record<string, unknown> };
    lgas: Lga[];
    filters: { search?: string; lga_id?: string };
    stateName?: string | null;
    statistics: Statistics;
    [key: string]: unknown;
}

export default function WardsIndex() {
    const { props } = usePage<PageProps>();
    const { wards, lgas, filters, stateName, statistics } = props;

    const columns = [
        {
            key: "name", label: "Ward",
            accessor: (row: Ward) => (
                <span className="font-['Syne',sans-serif] font-semibold text-[13px]">{row.name}</span>
            ),
        },
        {
            key: "lga", label: "LGA",
            accessor: (row: Ward) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{row.lga?.name ?? "—"}</span>
            ),
        },
        {
            key: "pus_count", label: "Polling Units",
            accessor: (row: Ward) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{row.pus_count}</span>
            ),
        },
        {
            key: "created_at", label: "Created",
            accessor: (row: Ward) => (
                <span className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
            ),
        },
    ];

    return (
        <>
            <Head title={stateName ? `${stateName} — Wards` : "Wards"} />
            <AppLayout
                SideNavigation={GovernorSidebar}
                title={stateName ? `${stateName} — Wards` : "Wards"}
                sub="Electoral wards in your state"
                live={false}
            >
                <StateLocationStats statistics={statistics} />

                <DataTable
                    data={wards} columns={columns as any}
                    indexUrl="/governor/wards"
                    filters={filters as Record<string, string>}
                    filterConfigs={[{
                        key: "lga_id", label: "LGA", value: filters.lga_id ?? "",
                        options: lgas.map((l) => ({ value: l.id, label: l.name })),
                    }]}
                    searchPlaceholder="Search wards..." noun="wards"
                    reloadOnly={["wards"]}
                    emptyIcon={<LayoutGrid size={32} />} emptyMessage="No wards found"
                />
            </AppLayout>
        </>
    );
}