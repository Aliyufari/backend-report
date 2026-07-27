// resources/js/pages/dashboard/governor/locations/pus/Index.tsx
import { usePage, Head } from "@inertiajs/react";
import { CircleDot } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import GovernorSidebar from "@/components/sidebar/GovernorSidebar";
import DataTable from "@/components/ui/DataTable";

interface Ward { id: string; name: string; }
interface Pu {
    id: string;
    name: string;
    code: string | null;
    ward: Ward & { lga?: { name: string } };
    created_at: string;
}

interface PageProps {
    pus: { data: Pu[]; links: unknown[]; meta: Record<string, unknown> };
    wards: Ward[];
    filters: { search?: string; ward_id?: string };
    [key: string]: unknown;
}

export default function PusIndex() {
    const { props } = usePage<PageProps>();
    const { pus, wards, filters } = props;

    const columns = [
        {
            key: "name", label: "Polling Unit",
            accessor: (row: Pu) => (
                <div>
                    <span className="font-['Syne',sans-serif] font-semibold text-[13px] block">{row.name}</span>
                    {row.code && (
                        <span className="font-['DM_Mono',monospace] text-[10px] text-muted-foreground">{row.code}</span>
                    )}
                </div>
            ),
        },
        {
            key: "ward", label: "Ward",
            accessor: (row: Pu) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{row.ward?.name ?? "—"}</span>
            ),
        },
        {
            key: "lga", label: "LGA",
            accessor: (row: Pu) => (
                <span className="font-['DM_Mono',monospace] text-[12px] text-muted-foreground">{row.ward?.lga?.name ?? "—"}</span>
            ),
        },
        {
            key: "created_at", label: "Created",
            accessor: (row: Pu) => (
                <span className="font-['DM_Mono',monospace] text-[11px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
            ),
        },
    ];

    return (
        <>
            <Head title="Polling Units" />
            <AppLayout SideNavigation={GovernorSidebar} title="Polling Units" sub="Polling units in your state" live={false}>
                <DataTable
                    data={pus} columns={columns as any}
                    indexUrl="/governor/pus"
                    filters={filters as Record<string, string>}
                    filterConfigs={[{
                        key: "ward_id", label: "Ward", value: filters.ward_id ?? "",
                        options: wards.map((w) => ({ value: w.id, label: w.name })),
                    }]}
                    searchPlaceholder="Search polling units..." noun="polling units"
                    reloadOnly={["pus"]}
                    emptyIcon={<CircleDot size={32} />} emptyMessage="No polling units found"
                />
            </AppLayout>
        </>
    );
}