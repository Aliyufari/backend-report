import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import GovernorSidebar from "@/components/sidebar/GovernorSidebar";
import accreditations from "@/routes/governor/accreditations";
import BlockList from "../components/BlockList";
import { Building2 } from "lucide-react";

interface Row {
    id: string; name: string;
    wards_count: number; pus_count: number;
    accredited_total: number;
}

interface Props {
    rows: Row[];
    parent: { id: string; name: string };
    electionId: string | null;
}

export default function Lgas({ rows, parent, electionId }: Props) {
    return (
        <>
            <Head title={`Accreditations — ${parent.name} LGAs`} />
            <AppLayout
                SideNavigation={GovernorSidebar}
                title={parent.name}
                sub="LGA-level accreditation summary"
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
                    detailHref={(row) =>
                        `${accreditations.wards(row.id).url}${electionId ? `?election_id=${electionId}` : ""}`
                    }
                    emptyMessage="No LGAs found for this zone."
                    icon={Building2}
                />
            </AppLayout>
        </>
    );
}