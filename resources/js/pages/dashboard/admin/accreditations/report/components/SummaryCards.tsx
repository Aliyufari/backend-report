// resources/js/pages/dashboard/admin/accreditations/report/SummaryCards.tsx
import { CheckCircle2, Clock3, AlertTriangle, Vote } from "lucide-react";

interface Stats {
    verified: number;
    pending: number;
    flagged: number;
    accredited_total: number;
    submission_percentage: number;
}

interface Props {
    stats: Stats;
}

export default function SummaryCards({ stats }: Props) {
    return (
        <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                    <div className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 size={14} />
                        <span className="text-xs font-medium">Verified</span>
                    </div>
                    <p className="mt-1.5 text-xl font-bold tabular-nums">{stats.verified.toLocaleString()}</p>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                    <div className="flex items-center gap-1.5 text-amber-700">
                        <Clock3 size={14} />
                        <span className="text-xs font-medium">Pending</span>
                    </div>
                    <p className="mt-1.5 text-xl font-bold tabular-nums">{stats.pending.toLocaleString()}</p>
                </div>

                <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                    <div className="flex items-center gap-1.5 text-red-700">
                        <AlertTriangle size={14} />
                        <span className="text-xs font-medium">Flagged</span>
                    </div>
                    <p className="mt-1.5 text-xl font-bold tabular-nums">{stats.flagged.toLocaleString()}</p>
                </div>

                <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                    <div className="flex items-center gap-1.5 text-primary">
                        <Vote size={14} />
                        <span className="text-xs font-medium">Accredited</span>
                    </div>
                    <p className="mt-1.5 text-xl font-bold tabular-nums">{stats.accredited_total.toLocaleString()}</p>
                </div>
            </div>

            <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Submission Progress</span>
                    <span className="font-semibold">{stats.submission_percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${stats.submission_percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}