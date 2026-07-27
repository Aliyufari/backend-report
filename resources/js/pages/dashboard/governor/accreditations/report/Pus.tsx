import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import GovernorSidebar from "@/components/sidebar/GovernorSidebar";
import accreditations from "@/routes/governor/accreditations";
import PuBlockList from "../components/PuBlockList";
import { CircleDot } from "lucide-react";

interface Row {
    id: string;
    name: string;
    code?: string;
    accreditation_id: string | null;
    accredited_voters: number | null;
    status: string | null;
    image_path: string | null;
}

interface Props {
    rows: Row[];
    parent: { id: string; name: string };
    electionId: string | null;
}

export default function Pus({ rows, parent, electionId }: Props) {
    return (
        <>
            <Head title={`Accreditations — ${parent.name} Polling Units`} />
            <AppLayout
                SideNavigation={GovernorSidebar}
                title={parent.name}
                sub="Select a polling unit to view its accreditation result"
                live
                actions={
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 rounded-lg text-sm font-semibold font-['Syne',sans-serif]
                            border border-border bg-transparent text-foreground hover:bg-muted transition-colors"
                    >
                        ← Back to Wards
                    </button>
                }
            >
                <PuBlockList
                    rows={rows}
                    detailHref={(row) =>
                        `${accreditations.pu(row.id).url}${electionId ? `?election_id=${electionId}` : ""}`
                    }
                    emptyMessage="No polling units found for this ward."
                    icon={CircleDot}
                />
            </AppLayout>
        </>
    );
}