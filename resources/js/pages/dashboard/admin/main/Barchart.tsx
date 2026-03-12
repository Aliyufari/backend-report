import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Monthly Target vs Achievement — matches reference image
const data = [
    { month: "February", target: 31248, achieved: 31248 },
    { month: "March",    target: 38126, achieved: 38126 },
    { month: "April",    target: 43752, achieved: 40000 },
];

const chartConfig = {
    target:   { label: "Target",   color: "#22c55e" },
    achieved: { label: "Achieved", color: "#3b82f6" },
} satisfies ChartConfig;

export function Barchart() {
    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700 }}>
                            Monthly Target vs Achievement
                        </CardTitle>
                        <CardDescription style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>
                            February – April 2025
                        </CardDescription>
                    </div>
                    {/* Legend */}
                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
                        {Object.entries(chartConfig).map(([key, cfg]) => (
                            <span key={key} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)" }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: cfg.color, display: "inline-block" }} />
                                {cfg.label}
                            </span>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <ChartContainer config={chartConfig} className="w-full h-[260px]">
                    <BarChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 0 }} barCategoryGap="30%" barGap={4}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tickFormatter={(v) => v.slice(0, 3)}
                            style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={48}
                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                            style={{ fontFamily: "'DM Mono', monospace", fontSize: 10 }}
                        />
                        <ChartTooltip
                            cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                            content={<ChartTooltipContent />}
                        />
                        <Bar dataKey="target" fill="#22c55e" fillOpacity={0.85} radius={[6, 6, 0, 0]}>
                            <LabelList
                                dataKey="target"
                                position="top"
                                offset={8}
                                formatter={(v: number) => v.toLocaleString()}
                                style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fill: "var(--foreground)" }}
                            />
                        </Bar>
                        <Bar dataKey="achieved" fill="#3b82f6" fillOpacity={0.85} radius={[6, 6, 0, 0]}>
                            <LabelList
                                dataKey="achieved"
                                position="top"
                                offset={8}
                                formatter={(v: number) => v.toLocaleString()}
                                style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fill: "var(--foreground)" }}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}