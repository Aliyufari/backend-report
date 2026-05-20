import { useEffect, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import { CalendarCheck } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import AdminSidebar from "@/components/sidebar/AdminSidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
    date: string | null;
    [key: string]: unknown;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ELECTION_DATE = new Date("2027-02-27T00:00:00");
const PROGRESS_START = new Date("2023-02-25T00:00:00");

const pad = (n: number) => String(n).padStart(2, "0");

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(target: Date) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        done: false,
    });

    useEffect(() => {
        const tick = () => {
            const diff = target.getTime() - Date.now();

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
                return;
            }

            const total = Math.floor(diff / 1000);

            setTimeLeft({
                days: Math.floor(total / 86400),
                hours: Math.floor((total % 86400) / 3600),
                minutes: Math.floor((total % 3600) / 60),
                seconds: total % 60,
                done: false,
            });
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [target]);

    return timeLeft;
}

// ─── Countdown Card (aligned with your dashboard cards) ──────────────────────

function CountdownCard({
    value,
    label,
    urgent,
}: {
    value: number | string;
    label: string;
    urgent?: boolean;
}) {
    return (
        <div
            className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-xl border overflow-hidden
            bg-card transition-colors
            ${urgent ? "border-red-200 bg-red-50" : "border-border"}`}
        >
            {/* watermark */}
            <span
                aria-hidden
                className="absolute -bottom-3 -right-1 text-7xl font-black opacity-[0.05] select-none"
            >
                {value}
            </span>

            <span
                className={`text-3xl font-bold tabular-nums
                ${urgent ? "text-red-600" : "text-foreground"}`}
            >
                {value}
            </span>

            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                {label}
            </span>
        </div>
    );
}

// ─── Progress ────────────────────────────────────────────────────────────────

function ElectionProgress() {
    const now = Date.now();
    const total = ELECTION_DATE.getTime() - PROGRESS_START.getTime();
    const elapsed = now - PROGRESS_START.getTime();
    const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Feb 25, 2023</span>
                <span>{pct.toFixed(1)}% elapsed</span>
            </div>

            <div className="h-2 w-full rounded-full bg-muted border overflow-hidden">
                <div
                    className="h-full bg-[#008751] transition-all"
                    style={{ width: `${pct.toFixed(1)}%` }}
                />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
                <span />
                <span>Feb 27, 2027</span>
            </div>
        </div>
    );
}

// ─── Flag ────────────────────────────────────────────────────────────────────

function NigeriaFlag() {
    return (
        <div className="flex h-5 w-[30px] overflow-hidden rounded border border-border">
            <div className="flex-1 bg-[#008751]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#008751]" />
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CountdownIndex() {
    const { props } = usePage<PageProps>();

    const targetDate = props.date ? new Date(props.date) : ELECTION_DATE;
    const { days, hours, minutes, seconds, done } = useCountdown(targetDate);

    const isUrgent = days < 30 && !done;

    const electionDateStr = targetDate.toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const todayStr = new Date().toLocaleDateString("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <>
            <Head title="2027 Election Countdown" />

            <AppLayout
                SideNavigation={AdminSidebar}
                title="2027 Election Countdown"
                sub="Nigeria Presidential & National Assembly General Election"
            >
                {/* MATCHES YOUR CVR PAGE SPACING */}
                <div className=" py-6 space-y-6">

                    {/* Header */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <NigeriaFlag />

                            <h2 className="text-lg font-semibold leading-none">
                                Nigeria 2027 General Election
                            </h2>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Presidential & National Assembly — {electionDateStr}
                        </p>
                    </div>

                    {/* Countdown grid */}
                    {!done ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <CountdownCard value={days} label="Days" urgent={isUrgent} />
                            <CountdownCard value={pad(hours)} label="Hours" />
                            <CountdownCard value={pad(minutes)} label="Minutes" />
                            <CountdownCard value={pad(seconds)} label="Seconds" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl border bg-emerald-50 border-emerald-200">
                            <CalendarCheck size={36} className="text-emerald-600" />
                            <p className="text-lg font-semibold text-emerald-700">
                                Election day has arrived!
                            </p>
                            <p className="text-sm text-emerald-600">
                                27 February 2027 — Go out and vote.
                            </p>
                        </div>
                    )}

                    {/* Progress */}
                    <ElectionProgress />

                    {/* Chips (same style as your dashboards) */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted border">
                            <CalendarCheck size={13} />
                            <span>Today: {todayStr}</span>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted border">
                            <CalendarCheck size={13} />
                            <span>Target: 27 Feb 2027</span>
                        </div>
                    </div>

                </div>
            </AppLayout>
        </>
    );
}