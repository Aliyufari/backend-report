import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import accreditations from "@/routes/admin/accreditations";
import BlockList from "./components/BlockList";
import { House } from "lucide-react";

interface Row {
    id: string;
    name: string;
    zones_count: number;
    lgas_count: number;
    wards_count: number;
    pus_count: number;
    accredited_total: number;
    [key: string]: any;
}

interface Election { id: string; title: string; }

interface Props {
    rows: Row[];
    elections: Election[];
    electionId: string | null;
}

export default function States({ rows, elections, electionId }: Props) {
    const handleElectionChange = (id: string) => {
        router.get(accreditations.index().url, { election_id: id }, { preserveState: true });
    };

    return (
        <>
            <Head title="Accreditation Report" />
            <AppLayout
                SideNavigation={AdminSidebar}
                title="Accreditations"
                sub="Nationwide accreditation summary"
                live
            >
                <div className="flex justify-end mb-4">
                    <select
                        value={electionId ?? ""}
                        onChange={(e) => handleElectionChange(e.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-['DM_Mono',monospace]"
                    >
                        {elections.map((election) => (
                            <option key={election.id} value={election.id}>{election.title}</option>
                        ))}
                    </select>
                </div>

                <BlockList
                    rows={rows}
                    columns={[
                        { key: "zones_count", label: "Zones" },
                        { key: "lgas_count", label: "LGAs" },
                        { key: "wards_count", label: "Wards" },
                        { key: "pus_count", label: "PUs" },
                    ]}
                    detailHref={(row) =>
                        `${accreditations.zones(row.id).url}${electionId ? `?election_id=${electionId}` : ""}`
                    }
                    emptyMessage="No states found."
                    icon={House}
                />
            </AppLayout>
        </>
    );
}