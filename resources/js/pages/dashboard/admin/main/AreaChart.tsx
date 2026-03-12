import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
    { month: "Feb", captures: 1972  },
    { month: "Mar", captures: 5230  },
    { month: "Mar2", captures: 5113  },
    { month: "Apr", captures: 6183  },
    { month: "May", captures: 45000 },
    { month: "Jun", captures: 80000 },
];

const chartConfig = {
    captures: {
        label: "Weekly Captures",
        color: "#22c55e",
    },
} satisfies ChartConfig;

export function AreaChart() {
    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700 }}>
                    Weekly Capture Trend
                </CardTitle>
                <CardDescription style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>
                    February – June 2025
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <ChartContainer config={chartConfig} className="w-full h-[220px] sm:h-[260px]">
                    <LineChart data={chartData} margin={{ left: 0, right: 8, top: 16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="captureGlow" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="#4ade80" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tickFormatter={(v) => v.replace(/\d/, "")}
                            style={{ fontFamily: "'DM Mono', monospace", fontSize: 10 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={4}
                            width={36}
                            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                            style={{ fontFamily: "'DM Mono', monospace", fontSize: 9 }}
                        />
                        <ChartTooltip
                            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                            content={<ChartTooltipContent />}
                        />
                        <Line
                            dataKey="captures"
                            type="monotone"
                            stroke="url(#captureGlow)"
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: "#22c55e", strokeWidth: 2, stroke: "var(--card)" }}
                            activeDot={{ r: 5, fill: "#22c55e", strokeWidth: 0 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}