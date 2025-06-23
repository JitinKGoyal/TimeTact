"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
    format,
    parseISO,
    startOfDay,
    differenceInMinutes,
} from "date-fns";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TimeLog = {
    id: string;
    startTime: string;
    endTime: string;
    description: string;
    utilization: "SLEEP" | "GOOD" | "NEUTRAL" | "BAD";
};

async function fetchTimeLogs(date: string) {
    const response = await fetch(`/api/time-logs?date=${date}`);
    if (!response.ok) {
        throw new Error("Failed to fetch time logs");
    }
    return response.json();
}

const utilizationColors: Record<TimeLog["utilization"], string> = {
    SLEEP: "bg-blue-500",
    GOOD: "bg-green-500",
    NEUTRAL: "bg-yellow-500",
    BAD: "bg-red-500",
};

export function DailyTimelineChart({ date }: { date: Date }) {
    const { data: timeLogs, isLoading, error } = useQuery<TimeLog[]>({
        queryKey: ["timeLogs", format(date, "yyyy-MM-dd")],
        queryFn: () => fetchTimeLogs(format(date, "yyyy-MM-dd")),
        // Refetch data when the window is refocused
        refetchOnWindowFocus: true,
    });

    const renderTimeline = () => {
        if (!timeLogs || timeLogs.length === 0) {
            return (
                <div className="text-center py-8 text-muted-foreground">
                    No activity for this day
                </div>
            );
        }

        const dayStart = startOfDay(date);
        const totalMinutesInDay = 24 * 60;

        return (
            <div>
                <div className="relative w-full h-8 bg-muted rounded-md overflow-hidden">
                    {timeLogs.map((log) => {
                        const start = parseISO(log.startTime);
                        const end = parseISO(log.endTime);
                        const startMinutes = differenceInMinutes(start, dayStart);
                        const durationMinutes = differenceInMinutes(end, start);

                        if (durationMinutes <= 0) return null;

                        const left = (startMinutes / totalMinutesInDay) * 100;
                        const width = (durationMinutes / totalMinutesInDay) * 100;

                        return (
                            <TooltipProvider key={log.id} delayDuration={100}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={cn(
                                                "absolute h-full",
                                                utilizationColors[log.utilization]
                                            )}
                                            style={{
                                                left: `${left}%`,
                                                width: `${width}%`,
                                            }}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-bold">{log.utilization}</p>
                                        <p>{log.description}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(start, "HH:mm")} -{" "}
                                            {format(end, "HH:mm")}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                    <span>0h</span>
                    <span>6h</span>
                    <span>12h</span>
                    <span>18h</span>
                    <span>24h</span>
                </div>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-[60px] w-full" />
                ) : error ? (
                    <div className="text-destructive text-center py-4">
                        Failed to load timeline data. Please try again.
                    </div>
                ) : (
                    renderTimeline()
                )}
            </CardContent>
        </Card>
    );
} 