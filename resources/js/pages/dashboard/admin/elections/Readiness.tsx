import { Head } from "@inertiajs/react";
import { CalendarDays, ShieldCheck } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";

interface Election {
    id: string;
    title: string;
    type: string | null;
    election_date: string | null;
    status: string;
}

interface Props {
    elections: { data: Election[] };
}

export default function Readiness({ elections }: Props) {
    const list = elections.data;

    return (
        <>
            <Head title="Election Readiness" />
            <AppLayout SideNavigation={AdminSidebar} title="Election Readiness" sub="Upcoming and ongoing elections at a glance" live={false}>
                {list.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <ShieldCheck size={28} className="text-muted-foreground mb-2" />
                        <p className="font-['DM_Mono',monospace] text-sm text-muted-foreground">
                            No upcoming or ongoing elections.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {list.map(election => (
                            <div key={election.id} className="bg-card border border-border rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-['Syne',sans-serif] font-bold text-base">{election.title}</h3>
                                    <span className={`text-[11px] px-2 py-1 rounded-full font-['DM_Mono',monospace] capitalize
                                        ${election.status === "ongoing" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-blue-50 text-blue-600 border border-blue-200"}`}>
                                        {election.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-['DM_Mono',monospace]">
                                    <CalendarDays size={13} />
                                    {election.election_date ? new Date(election.election_date).toLocaleDateString() : "Date TBD"}
                                </div>
                                {election.type && (
                                    <p className="text-xs text-muted-foreground mt-2 font-['DM_Mono',monospace]">{election.type}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </AppLayout>
        </>
    );
}