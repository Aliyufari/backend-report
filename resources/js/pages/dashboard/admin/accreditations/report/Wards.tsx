import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import accreditations from "@/routes/admin/accreditations";
import BlockList from "./components/BlockList";
import { LayoutGrid } from "lucide-react";

interface Row {
    id: string; name: string;
    pus_count: number;
    accredited_total: number;
}

interface Props {
    rows: Row[];
    parent: { id: string; name: string };
    electionId: string | null;
}

export default function Wards({ rows, parent, electionId }: Props) {
    return (
        <>
            <Head title={`Accreditations — ${parent.name} Wards`} />
            <AppLayout
                SideNavigation={AdminSidebar}
                title={parent.name}
                sub="Ward-level accreditation summary"
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
                    detailHref={(row) =>
                        `${accreditations.pus(row.id).url}${electionId ? `?election_id=${electionId}` : ""}`
                    }
                    emptyMessage="No wards found for this LGA."
                    icon={LayoutGrid}
                />
            </AppLayout>
        </>
    );
}