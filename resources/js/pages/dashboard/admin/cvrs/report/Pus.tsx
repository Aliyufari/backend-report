import { Head, Link } from "@inertiajs/react";
import { ArrowUpRight, MapPin, IdCard } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import cvrsReport from "@/routes/admin/cvrs-report";

interface Row {
    id: string;
    name: string;
    code?: string;
    total_cvrs: number;
    pending: number;
    approved: number;
    rejected: number;
    has_cvr: boolean;
}

interface Props {
    rows: Row[];
    parent: { id: string; name: string };
}

export default function Pus({ rows, parent }: Props) {
    return (
        <>
            <Head title={`CVR Report — ${parent.name} Polling Units`} />
            <AppLayout
                SideNavigation={AdminSidebar}
                title={parent.name}
                sub="Select a polling unit to view its CVR records"
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
                {rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-border bg-card">
                        <MapPin size={26} className="text-muted-foreground mb-2" />
                        <p className="font-['DM_Mono',monospace] text-sm text-muted-foreground">
                            No polling units found for this ward.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {rows.map((row) => (
                            <div
                                key={row.id}
                                className="group flex items-center gap-4 rounded-2xl border border-border bg-card
                                    px-5 py-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-[1px]"
                            >
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                    bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]
                                    border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                                    <MapPin size={17} className="text-primary" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        {row.code && (
                                            <span className="text-[11px] font-['DM_Mono',monospace] text-muted-foreground flex-shrink-0">
                                                {row.code}
                                            </span>
                                        )}
                                        <p className="font-['Syne',sans-serif] font-bold text-[15px] truncate">{row.name}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <span className="inline-flex items-center gap-1 text-[11px] font-['DM_Mono',monospace] px-2 py-0.5 rounded-full
                                            bg-[color-mix(in_oklch,var(--primary)_8%,transparent)] text-primary font-semibold">
                                            <IdCard size={11} /> {row.total_cvrs.toLocaleString()} CVR{row.total_cvrs === 1 ? "" : "s"}
                                        </span>

                                        {row.has_cvr ? (
                                            <>
                                                {row.pending > 0 && (
                                                    <span className="text-[11px] font-['DM_Mono',monospace] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                                                        {row.pending} pending
                                                    </span>
                                                )}
                                                {row.approved > 0 && (
                                                    <span className="text-[11px] font-['DM_Mono',monospace] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                        {row.approved} approved
                                                    </span>
                                                )}
                                                {row.rejected > 0 && (
                                                    <span className="text-[11px] font-['DM_Mono',monospace] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                                                        {row.rejected} rejected
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-[11px] font-['DM_Mono',monospace] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                No records
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Link
                                    href={cvrsReport.pu(row.id).url}
                                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px]
                                        font-['Syne',sans-serif] font-semibold border border-border bg-transparent text-foreground
                                        transition-all group-hover:border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground"
                                >
                                    Details
                                    <ArrowUpRight size={13} />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </AppLayout>
        </>
    );
}