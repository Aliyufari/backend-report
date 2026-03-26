/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useChart } from "@/hooks/dashboard/useChart";

const COLORS = {
    leboku:     "#22c55e",
    ikot_ansa:  "#3b82f6",
    ikot_ekpo:  "#f59e0b",
    eka_isekut: "#ef4444",
};

const data = [
    { name: "leboku",     label: "Leboku",     value: 54.77, fill: COLORS.leboku     },
    { name: "ikot_ansa",  label: "Ikot Ansa",  value: 16.79, fill: COLORS.ikot_ansa  },
    { name: "ikot_ekpo",  label: "Ikot Ekpo",  value: 19.29, fill: COLORS.ikot_ekpo  },
    { name: "eka_isekut", label: "Eka Isekut", value: 9.97,  fill: COLORS.eka_isekut },
];

const chartConfig = {
    leboku:     { label: "Leboku",     color: COLORS.leboku     },
    ikot_ansa:  { label: "Ikot Ansa",  color: COLORS.ikot_ansa  },
    ikot_ekpo:  { label: "Ikot Ekpo",  color: COLORS.ikot_ekpo  },
    eka_isekut: { label: "Eka Isekut", color: COLORS.eka_isekut },
} satisfies ChartConfig;

export function PieDonut() {
    const id = "pie-interactive";
    const [selected, setSelected] = React.useState(data[0].name);
    const activeIndex = React.useMemo(() => data.findIndex((d) => d.name === selected), [selected]);
    const { ref, ready } = useChart();

    return (
        <Card data-chart={id} className="flex flex-col w-full min-w-0">
            <ChartStyle id={id} config={chartConfig} />
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700 }}>
                            Month Target
                        </CardTitle>
                        <CardDescription style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>
                            By Senatorial Zone · 2025
                        </CardDescription>
                    </div>
                    <Select value={selected} onValueChange={setSelected}>
                        <SelectTrigger className="h-7 w-[120px] rounded-lg" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end" className="rounded-xl">
                            {data.map((item) => (
                                <SelectItem key={item.name} value={item.name} className="rounded-lg [&_span]:flex">
                                    <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
                                        <span style={{ width: 8, height: 8, borderRadius: 2, background: item.fill, display: "inline-block", flexShrink: 0 }} />
                                        {item.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col items-center pt-0 pb-4">
                <div ref={ref} className="w-full min-w-0 h-[220px]">
                    {ready && (
                        <ChartContainer id={id} config={chartConfig} className="w-full h-full">
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel formatter={(value) => [`${value}%`, ""]} />}
                                />
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={60}
                                    outerRadius={88}
                                    strokeWidth={3}
                                    stroke="var(--card)"
                                    activeIndex={activeIndex}
                                    activeShape={({ outerRadius = 0, ...props }: any) => (
                                        <g>
                                            <Sector {...props} outerRadius={outerRadius + 8} />
                                            <Sector {...props} outerRadius={outerRadius + 20} innerRadius={outerRadius + 10} opacity={0.2} />
                                        </g>
                                    )}
                                >
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 8} style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, fill: "var(--foreground)" }}>
                                                            {data[activeIndex].value}%
                                                        </tspan>
                                                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 16} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fill: "var(--muted-foreground)" }}>
                                                            {data[activeIndex].label}
                                                        </tspan>
                                                    </text>
                                                );
                                            }
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", width: "100%", paddingInline: 8 }}>
                    {data.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setSelected(item.name)}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "6px 8px", borderRadius: 8,
                                border: `1px solid ${selected === item.name ? item.fill + "55" : "transparent"}`,
                                background: selected === item.name ? item.fill + "12" : "transparent",
                                cursor: "pointer", transition: "all 0.15s ease", textAlign: "left"
                            }}
                        >
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: item.fill, flexShrink: 0 }} />
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", flex: 1 }}>
                                {item.label}
                            </span>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: "var(--foreground)" }}>
                                {item.value}%
                            </span>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}