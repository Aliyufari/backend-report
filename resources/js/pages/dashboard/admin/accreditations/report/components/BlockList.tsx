import { Link } from "@inertiajs/react";
import { MapPin, ArrowUpRight, type LucideIcon } from "lucide-react";

interface Row {
    id: string;
    name: string;
    accredited_total: number;
    [key: string]: any;
}

interface Column {
    key: string;
    label: string;
}

interface Props {
    rows: Row[];
    columns: Column[];
    detailHref: (row: Row) => string;
    emptyMessage?: string;
    icon?: LucideIcon;
    actionIcon?: LucideIcon;
}

export default function BlockList({
    rows,
    columns,
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
            {rows.map((row) => (
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
                        <p className="font-['Syne',sans-serif] font-bold text-[15px] truncate">{row.name}</p>

                        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-1.5">
                            {columns.map((column) => (
                                <span key={column.key} className="text-[11px] font-['DM_Mono',monospace] text-muted-foreground">
                                    {column.label}{" "}
                                    <span className="text-foreground font-semibold">
                                        {Number(row[column.key] ?? 0).toLocaleString()}
                                    </span>
                                </span>
                            ))}
                            <span className="text-[11px] font-['DM_Mono',monospace] px-2 py-0.5 rounded-full
                                bg-[color-mix(in_oklch,var(--primary)_8%,transparent)] text-primary font-semibold">
                                {Number(row.accredited_total).toLocaleString()} accredited
                            </span>
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
            ))}
        </div>
    );
}