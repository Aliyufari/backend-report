import { usePage, Head } from "@inertiajs/react";
import { Building2 } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import GovernorSidebar from "@/components/sidebar/GovernorSidebar";
import DataTable from "@/components/ui/DataTable";
import StateLocationStats from "@/components/locations/StateLocationStats";

interface Zone { id: string; name: string; }
interface Lga {
    id: string;
    name: string;
    zone: Zone;
    wards_count: number;
    created_at: string;
}

interface Statistics { zones: number; lgas: number; wards: number; pus: number; }

interface PageProps {
    lgas: { data: Lga[]; links: unknown[]; meta: Record<string, unknown> };
    zones: Zone[];
    filters: { search?: string; zone_id?: string };
    stateName?: string | null;
    statistics: Statistics;
    [key: string]: unknown;
}

export default function LgasIndex() {
    const { props } = usePage<PageProps>();
    const { lgas, zones, filters, stateName, statistics } = props;

    const columns = [
        {
            key: "name", label: "LGA",
            accessor: (row: Lga) => (
                <span className="font-['Syne',sans-serif] font-semibold text-[13px]">{row.name}</span>
            ),
        },
        {
            key: "zone", label: "Zone",
            accessor: (row: Lga) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{row.zone?.name ?? "—"}</span>
            ),
        },
        {
            key: "wards_count", label: "Wards",
            accessor: (row: Lga) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{row.wards_count}</span>
            ),
        },
        {
            key: "created_at", label: "Created",
            accessor: (row: Lga) => (
                <span className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
            ),
        },
    ];

    return (
        <>
            <Head title={stateName ? `${stateName} — LGAs` : "LGAs"} />
            <AppLayout
                SideNavigation={GovernorSidebar}
                title={stateName ? `${stateName} — LGAs` : "LGAs"}
                sub="Local government areas in your state"
                live={false}
            >
                <StateLocationStats statistics={statistics} />

                <DataTable
                    data={lgas} columns={columns as any}
                    indexUrl="/governor/lgas"
                    filters={filters as Record<string, string>}
                    filterConfigs={[{
                        key: "zone_id", label: "Zone", value: filters.zone_id ?? "",
                        options: zones.map((z) => ({ value: z.id, label: z.name })),
                    }]}
                    searchPlaceholder="Search LGAs..." noun="LGAs"
                    reloadOnly={["lgas"]}
                    emptyIcon={<Building2 size={32} />} emptyMessage="No LGAs found"
                />
            </AppLayout>
        </>
    );
}