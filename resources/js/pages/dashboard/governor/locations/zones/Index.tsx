import { usePage, Head } from "@inertiajs/react";
import { Layers } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import GovernorSidebar from "@/components/sidebar/GovernorSidebar";
import DataTable from "@/components/ui/DataTable";
import StateLocationStats from "@/components/locations/StateLocationStats";

interface Zone {
    id: string;
    name: string;
    state: { id: string; name: string };
    lgas_count: number;
    created_at: string;
}

interface Statistics { zones: number; lgas: number; wards: number; pus: number; }

interface PageProps {
    zones: { data: Zone[]; links: unknown[]; meta: Record<string, unknown> };
    filters: { search?: string };
    stateName?: string | null;
    statistics: Statistics;
    [key: string]: unknown;
}

export default function ZonesIndex() {
    const { props } = usePage<PageProps>();
    const { zones, filters, stateName, statistics } = props;

    const columns = [
        {
            key: "name", label: "Zone",
            accessor: (row: Zone) => (
                <span className="font-['Syne',sans-serif] font-semibold text-[13px]">{row.name}</span>
            ),
        },
        {
            key: "lgas_count", label: "LGAs",
            accessor: (row: Zone) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{row.lgas_count}</span>
            ),
        },
        {
            key: "created_at", label: "Created",
            accessor: (row: Zone) => (
                <span className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
            ),
        },
    ];

    return (
        <>
            <Head title={stateName ? `${stateName} — Zones` : "Zones"} />
            <AppLayout
                SideNavigation={GovernorSidebar}
                title={stateName ? `${stateName} — Zones` : "Zones"}
                sub="Senatorial zones in your state"
                live={false}
            >
                <StateLocationStats statistics={statistics} />

                <DataTable
                    data={zones} columns={columns as any}
                    indexUrl="/governor/zones"
                    filters={filters as Record<string, string>}
                    searchPlaceholder="Search zones..." noun="zones"
                    reloadOnly={["zones"]}
                    emptyIcon={<Layers size={32} />} emptyMessage="No zones found"
                />
            </AppLayout>
        </>
    );
}