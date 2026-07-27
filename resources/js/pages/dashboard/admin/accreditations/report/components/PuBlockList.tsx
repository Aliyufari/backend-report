import { Link } from "@inertiajs/react";
import { ArrowUpRight, MapPin, ImageOff, CheckCircle2, Clock, Flag, type LucideIcon } from "lucide-react";

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
    detailHref: (row: Row) => string;
    emptyMessage?: string;
    icon?: LucideIcon;
    actionIcon?: LucideIcon;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    verified: { label: "Verified", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <CheckCircle2 size={11} /> },
    pending:  { label: "Pending",  color: "text-amber-600 bg-amber-50 border-amber-200",   icon: <Clock size={11} /> },
    flagged:  { label: "Flagged",  color: "text-red-600 bg-red-50 border-red-200",         icon: <Flag size={11} /> },
};

export default function PuBlockList({
    rows,
    detailHref,
    emptyMessage = "No records found.",
    icon: Icon = MapPin,
    actionIcon: ActionIcon = ArrowUpRight,
}: Props) {
    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-border bg-card">
                <Icon size={26} className="text-muted-foreground mb-2" />
                <p className="font-['DM_Mono',monospace] text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-2.5">
            {rows.map((row) => {
                const cfg = row.status ? STATUS_CONFIG[row.status] : null;

                return (
                    <div
                        key={row.id}
                        className="group flex items-center gap-4 rounded-2xl border border-border bg-card
                            px-5 py-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-[1px]"
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                            bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]
                            border border-[color-mix(in_oklch,var(--primary)_20%,transparent)]">
                            <Icon size={17} className="text-primary" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-['Syne',sans-serif] font-bold text-[15px] truncate">{row.name}</p>
                                {row.code && (
                                    <span className="text-[11px] font-['DM_Mono',monospace] text-muted-foreground flex-shrink-0">
                                        {row.code}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className="text-[11px] font-['DM_Mono',monospace] px-2 py-0.5 rounded-full
                                    bg-[color-mix(in_oklch,var(--primary)_8%,transparent)] text-primary font-semibold">
                                    {row.accredited_voters !== null ? row.accredited_voters.toLocaleString() : "—"} accredited
                                </span>

                                {cfg ? (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]
                                        font-['DM_Mono',monospace] font-medium border ${cfg.color}`}>
                                        {cfg.icon} {cfg.label}
                                    </span>
                                ) : (
                                    <span className="text-[11px] font-['DM_Mono',monospace] px-2 py-0.5 rounded-full
                                        bg-muted text-muted-foreground">
                                        Not submitted
                                    </span>
                                )}

                                {row.image_path ? (
                                    <span className="text-[11px] font-['DM_Mono',monospace] text-emerald-600">✓ Image</span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-['DM_Mono',monospace] text-muted-foreground">
                                        <ImageOff size={11} /> No image
                                    </span>
                                )}
                            </div>
                        </div>

                        <Link
                            href={detailHref(row)}
                            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px]
                                font-['Syne',sans-serif] font-semibold border border-border bg-transparent text-foreground
                                transition-all group-hover:border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground"
                        >
                            Details
                            <ActionIcon size={13} />
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}