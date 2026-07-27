import { Head } from "@inertiajs/react";
import { ArrowLeft, IdCard } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import GovernorSidebar from "@/components/sidebar/GovernorSidebar";

interface CvrRecord {
    id: string;
    unique_id: string;
    type: string;
    status: string;
    created_at: string;
}

interface Props {
    pu: { id: string; name: string; code?: string };
    records: CvrRecord[];
    statistics: { total: number; pending: number; approved: number; rejected: number };
}

const STATUS_COLORS: Record<string, string> = {
    pending: "text-amber-600 bg-amber-50 border-amber-200",
    approved: "text-emerald-600 bg-emerald-50 border-emerald-200",
    rejected: "text-red-600 bg-red-50 border-red-200",
};

export default function PuCvrs({ pu, records, statistics }: Props) {
    return (
        <>
            <Head title={`CVR Records — ${pu.name}`} />
            <AppLayout
                SideNavigation={GovernorSidebar}
                title={pu.name}
                sub={pu.code ? `PU Code: ${pu.code}` : "Polling Unit"}
                live={false}
            >
                <button onClick={() => window.history.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 hover:text-foreground">
                    <ArrowLeft size={14} /> Back
                </button>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="rounded-xl border border-border bg-card p-3">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-xl font-bold tabular-nums">{statistics.total}</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                        <p className="text-xs text-amber-700">Pending</p>
                        <p className="text-xl font-bold tabular-nums">{statistics.pending}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                        <p className="text-xs text-emerald-700">Approved</p>
                        <p className="text-xl font-bold tabular-nums">{statistics.approved}</p>
                    </div>
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                        <p className="text-xs text-red-700">Rejected</p>
                        <p className="text-xl font-bold tabular-nums">{statistics.rejected}</p>
                    </div>
                </div>

                {records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-border bg-card">
                        <IdCard size={26} className="text-muted-foreground mb-2" />
                        <p className="font-['DM_Mono',monospace] text-sm text-muted-foreground">
                            No CVR records for this polling unit yet.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th className="text-left px-4 py-3 font-['Syne',sans-serif] font-semibold text-xs uppercase tracking-wide text-muted-foreground">Unique ID</th>
                                    <th className="text-left px-4 py-3 font-['Syne',sans-serif] font-semibold text-xs uppercase tracking-wide text-muted-foreground">Type</th>
                                    <th className="text-center px-4 py-3 font-['Syne',sans-serif] font-semibold text-xs uppercase tracking-wide text-muted-foreground">Status</th>
                                    <th className="text-right px-4 py-3 font-['Syne',sans-serif] font-semibold text-xs uppercase tracking-wide text-muted-foreground">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r) => (
                                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-mono text-[12px] font-semibold">{r.unique_id}</td>
                                        <td className="px-4 py-3 capitalize text-xs text-muted-foreground">{r.type}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-['DM_Mono',monospace] font-medium border capitalize ${STATUS_COLORS[r.status] ?? ""}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                                            {new Date(r.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </AppLayout>
        </>
    );
}