"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { differenceInMinutes, format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import {
    Bar,
    BarChart,
    Legend,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from "recharts";
import { useRef } from "react";

type TimeLog = {
    id: string;
    startTime: string;
    endTime: string;
    description: string;
    utilization: "SLEEP" | "GOOD" | "NEUTRAL" | "BAD";
};

type ChartData = {
    name: string;
    sleep: number;
    good: number;
    neutral: number;
    bad: number;
    logs: TimeLog[];
};

async function fetchTimeLogs(date: string) {
    const response = await fetch(`/api/time-logs?date=${date}`);
    if (!response.ok) {
        throw new Error("Failed to fetch time logs");
    }
    return response.json();
}

function calculateUtilizationHours(timeLogs: TimeLog[]): ChartData {
    const utilizationMinutes = {
        SLEEP: 0,
        GOOD: 0,
        NEUTRAL: 0,
        BAD: 0,
    };

    timeLogs.forEach((log) => {
        const start = parseISO(log.startTime);
        const end = parseISO(log.endTime);
        const durationMinutes = differenceInMinutes(end, start);
        utilizationMinutes[log.utilization] += durationMinutes;
    });

    return {
        name: "Utilization",
        sleep: Number((utilizationMinutes.SLEEP / 60).toFixed(2)),
        good: Number((utilizationMinutes.GOOD / 60).toFixed(2)),
        neutral: Number((utilizationMinutes.NEUTRAL / 60).toFixed(2)),
        bad: Number((utilizationMinutes.BAD / 60).toFixed(2)),
        logs: timeLogs,
    };
}

type CustomTooltipProps = TooltipProps<number, string> & {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
        payload: ChartData;
    }>;
};

export function TimeUtilizationChart({ date }: { date: Date }) {
    const { data: timeLogs, isLoading, error } = useQuery<TimeLog[]>({
        queryKey: ["timeLogs", format(date, "yyyy-MM-dd")],
        queryFn: () => fetchTimeLogs(format(date, "yyyy-MM-dd")),
    });
    const hoveredBarName = useRef<string | null>(null);

    const chartData = timeLogs ? [calculateUtilizationHours(timeLogs)] : [];

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Time Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Time Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-destructive text-center py-4">
                        Failed to load utilization data. Please try again.
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!timeLogs?.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Time Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        No activity for this day
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Time Utilization</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-[100px] sm:h-[120px] md:h-[150px]"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{
                                top: 5,
                                right: 10,
                                left: 5,
                                bottom: 5
                            }}
                            barSize={50}
                            className="[&_.recharts-wrapper]:!bg-transparent [&_.recharts-surface]:!bg-transparent"
                        >
                            <defs>
                                <linearGradient id="chartBackground" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(var(--background))" />
                                    <stop offset="100%" stopColor="hsl(var(--background))" />
                                </linearGradient>
                            </defs>
                            <rect
                                x={0}
                                y={0}
                                width="100%"
                                height="100%"
                                fill="url(#chartBackground)"
                            />
                            <XAxis
                                type="number"
                                domain={[0, 24]}
                                tickFormatter={(value) => `${value}h`}
                                stroke="hsl(var(--foreground))"
                                tick={{ fill: "hsl(var(--foreground))" }}
                                className="text-xs sm:text-sm"
                                padding={{ left: 10, right: 10 }}
                                allowDataOverflow={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={0}
                                stroke="hsl(var(--foreground))"
                                tick={{ fill: "hsl(var(--foreground))" }}
                                className="text-xs sm:text-sm"
                                hide={true}
                            />
                            <Tooltip
                                content={<CustomTooltip hoveredBarName={hoveredBarName} />}
                                cursor={{ fill: "transparent" }}
                            />
                            <Legend
                                wrapperStyle={{
                                    color: "hsl(var(--foreground))",
                                    fontSize: "0.75rem",
                                    paddingTop: "0.5rem"
                                }}
                            />
                            <Bar
                                dataKey="sleep"
                                name="Sleep"
                                stackId="a"
                                fill="#3b82f6"
                                radius={[4, 4, 4, 4]}
                                className="[&_.recharts-bar-rectangle]:rounded-[4px] sm:[&_.recharts-bar-rectangle]:rounded-[8px]"
                                stroke="#ffffff"
                                strokeWidth={1}
                                onMouseEnter={() => hoveredBarName.current = "Sleep"}
                                onMouseLeave={() => hoveredBarName.current = null}
                            />
                            <Bar
                                dataKey="good"
                                name="Good"
                                stackId="a"
                                fill="#22c55e"
                                radius={[4, 4, 4, 4]}
                                className="[&_.recharts-bar-rectangle]:rounded-[4px] sm:[&_.recharts-bar-rectangle]:rounded-[8px]"
                                stroke="#ffffff"
                                strokeWidth={1}
                                onMouseEnter={() => hoveredBarName.current = "Good"}
                                onMouseLeave={() => hoveredBarName.current = null}
                            />
                            <Bar
                                dataKey="neutral"
                                name="Neutral"
                                stackId="a"
                                fill="#eab308"
                                radius={[4, 4, 4, 4]}
                                className="[&_.recharts-bar-rectangle]:rounded-[4px] sm:[&_.recharts-bar-rectangle]:rounded-[8px]"
                                stroke="#ffffff"
                                strokeWidth={1}
                                onMouseEnter={() => hoveredBarName.current = "Neutral"}
                                onMouseLeave={() => hoveredBarName.current = null}
                            />
                            <Bar
                                dataKey="bad"
                                name="Bad"
                                stackId="a"
                                fill="#ef4444"
                                radius={[4, 4, 4, 4]}
                                className="[&_.recharts-bar-rectangle]:rounded-[4px] sm:[&_.recharts-bar-rectangle]:rounded-[8px]"
                                stroke="#ffffff"
                                strokeWidth={1}
                                onMouseEnter={() => hoveredBarName.current = "Bad"}
                                onMouseLeave={() => hoveredBarName.current = null}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </CardContent>
        </Card>
    );
}

const CustomTooltip = ({ active, payload, hoveredBarName }: CustomTooltipProps & { hoveredBarName: React.MutableRefObject<string | null> }) => {
    // Debug log for tooltip state
    console.log("CustomTooltip called", { active, payload, hoveredBarName: hoveredBarName.current });

    if (!active || !payload?.length || !hoveredBarName.current) return null;

    // (Use hoveredBarName.current to decide which bar is "selected")
    const selectedBar = payload.find((item) => item.name === hoveredBarName.current);

    console.log("Selected bar (from hoveredBarName):", selectedBar);

    if (!selectedBar) return null;

    // (Add a type guard (or non-null assertion) so that selectedBar.name is not possibly undefined)
    const utilizationType = (selectedBar.name as string).toLowerCase() as "good" | "neutral" | "bad";

    const logs = selectedBar.payload.logs.filter(
        (log: TimeLog) => log.utilization === utilizationType.toUpperCase()
    );

    console.log("Filtered logs for", utilizationType, logs);

    if (logs.length === 0) return null;

    return (
        <div className="rounded-lg border bg-background p-3 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
                <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: selectedBar.color }}
                />
                <span className="text-sm font-medium">
                    {selectedBar.name}: {selectedBar.value}h
                </span>
            </div>
            <div className="space-y-2">
                {logs.map((log: TimeLog) => {
                    const start = parseISO(log.startTime);
                    const end = parseISO(log.endTime);
                    const duration = differenceInMinutes(end, start) / 60;
                    return (
                        <div key={log.id} className="text-sm">
                            <div className="font-medium">
                                {format(start, "h:mm a")} – {format(end, "h:mm a")}
                                <span className="ml-2 text-muted-foreground">
                                    ({duration.toFixed(1)}h)
                                </span>
                            </div>
                            <div className="text-muted-foreground">{log.description}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}; 