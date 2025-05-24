"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

type TimeLog = {
    id: string;
    startTime: string;
    endTime: string;
    description: string;
    utilization: "SLEEP" | "GOOD" | "NEUTRAL" | "BAD";
};

const utilizationColors = {
    SLEEP: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    GOOD: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    NEUTRAL: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    BAD: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

const utilizationEmojis = {
    SLEEP: "💤",
    GOOD: "🟩",
    NEUTRAL: "🟨",
    BAD: "🟥",
};

async function fetchTimeLogs(date: string) {
    const response = await fetch(`/api/time-logs?date=${date}`);
    if (!response.ok) {
        throw new Error("Failed to fetch time logs");
    }
    return response.json();
}

export function TimeLogsList({
    date,
    onDateChange
}: {
    date: Date;
    onDateChange: (date: Date) => void;
}) {
    const { data: timeLogs, isLoading, error } = useQuery<TimeLog[]>({
        queryKey: ["timeLogs", format(date, "yyyy-MM-dd")],
        queryFn: () => fetchTimeLogs(format(date, "yyyy-MM-dd")),
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Time Logs</CardTitle>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <CalendarComponent
                                mode="single"
                                selected={date}
                                onSelect={(date) => date && onDateChange(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-destructive text-center py-4">
                        Failed to load time logs. Please try again.
                    </div>
                ) : timeLogs?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No logs for this day
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {timeLogs?.map((log) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">
                                                {format(parseISO(log.startTime), "h:mm a")} –{" "}
                                                {format(parseISO(log.endTime), "h:mm a")}
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "font-normal",
                                                    utilizationColors[log.utilization]
                                                )}
                                            >
                                                {utilizationEmojis[log.utilization]}{" "}
                                                {log.utilization.charAt(0) +
                                                    log.utilization.slice(1).toLowerCase()}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {log.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </CardContent>
        </Card>
    );
} 