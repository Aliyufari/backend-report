import { Layers, Building2, LayoutGrid, CircleDot, type LucideIcon } from "lucide-react";

interface Statistics {
    zones: number;
    lgas: number;
    wards: number;
    pus: number;
}

interface Props {
    statistics: Statistics;
}

const CARDS: { key: keyof Statistics; label: string; icon: LucideIcon; color: string; valueColor: string; dot: string }[] = [
    { key: "zones", label: "Zones", icon: Layers, color: "bg-blue-50 border-blue-200", valueColor: "text-blue-800", dot: "bg-blue-400" },
    { key: "lgas", label: "LGAs", icon: Building2, color: "bg-emerald-50 border-emerald-200", valueColor: "text-emerald-600", dot: "bg-emerald-400" },
    { key: "wards", label: "Wards", icon: LayoutGrid, color: "bg-amber-50 border-amber-200", valueColor: "text-amber-600", dot: "bg-amber-400" },
    { key: "pus", label: "Polling Units", icon: CircleDot, color: "bg-purple-50 border-purple-200", valueColor: "text-purple-700", dot: "bg-purple-400" },
];

export default function StateLocationStats({ statistics }: Props) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {CARDS.map(({ key, label, icon: Icon, color, valueColor, dot }) => {
                const value = statistics[key];
                return (
                    <div key={key} className={`relative flex flex-col gap-3 p-4 rounded-xl border ${color} overflow-hidden`}>
                        <span
                            aria-hidden
                            className="pointer-events-none absolute -bottom-3 -right-1 text-7xl font-black opacity-[0.06] select-none leading-none"
                        >
                            {value.toLocaleString()}
                        </span>

                        <span className="flex items-center gap-1.5">
                            <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
                            <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                                {label}
                            </span>
                        </span>

                        <span className={`text-2xl font-bold tabular-nums ${valueColor}`}>
                            {value.toLocaleString()}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}