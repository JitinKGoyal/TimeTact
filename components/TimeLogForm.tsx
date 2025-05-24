"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, FileText, Activity, Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Slider } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Function to get current date and time
const getCurrentDateTime = () => {
    const now = new Date();
    return {
        date: format(now, "yyyy-MM-dd"),
        time: format(now, "HH:mm")
    };
};

const timeLogSchema = z.object({
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    description: z.string().min(1, "Description is required"),
    utilization: z.enum(["SLEEP", "GOOD", "NEUTRAL", "BAD"], {
        required_error: "Please select a utilization level",
    }),
}).refine((data) => {
    const start = new Date(`${data.date}T${data.startTime}`);
    const end = new Date(`${data.date}T${data.endTime}`);
    return end >= start;
}, {
    message: "End time must be equal to or after start time",
    path: ["endTime"],
});

type TimeLogFormValues = z.infer<typeof timeLogSchema>;

// Update the TimeSlider styled component
const TimeSlider = styled(Slider)(({ theme }) => ({
    color: theme.palette.primary.main,
    height: 8,
    '& .MuiSlider-track': {
        border: 'none',
    },
    '& .MuiSlider-rail': {
        backgroundColor: theme.palette.grey[200],
    },
    '& .MuiSlider-thumb': {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
        },
        '&:before': {
            display: 'none',
        },
    },
    '& .MuiSlider-valueLabel': {
        lineHeight: 1.2,
        fontSize: 12,
        background: 'unset',
        padding: 0,
        width: 32,
        height: 32,
        borderRadius: '50% 50% 50% 0',
        backgroundColor: theme.palette.primary.main,
        transformOrigin: 'bottom left',
        transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
        '&:before': { display: 'none' },
        '&.MuiSlider-valueLabelOpen': {
            transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
        },
        '& > *': {
            transform: 'rotate(45deg)',
        },
    },
    '& .MuiSlider-mark': {
        backgroundColor: theme.palette.error.main,
        height: 8,
        width: 2,
        '&.MuiSlider-markActive': {
            backgroundColor: theme.palette.error.main,
        },
    },
}));

const utilizationColors = {
    SLEEP: "bg-blue-200",
    GOOD: "bg-green-200",
    NEUTRAL: "bg-yellow-200",
    BAD: "bg-red-200",
};

function TimeRangePicker({
    startTime,
    endTime,
    onStartTimeChange,
    onEndTimeChange,
    date
}: {
    startTime: string;
    endTime: string;
    onStartTimeChange: (time: string) => void;
    onEndTimeChange: (time: string) => void;
    date: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [existingTimeLogs, setExistingTimeLogs] = useState<Array<{ startTime: string; endTime: string; utilization: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch existing time logs when date changes
    useEffect(() => {
        const fetchTimeLogs = async () => {
            if (!date) return;

            setIsLoading(true);
            try {
                const response = await fetch(`/api/time-log?date=${date}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch time logs');
                }
                const data = await response.json();
                setExistingTimeLogs(data);
            } catch (error) {
                console.error('Error fetching time logs:', error);
                toast.error('Failed to fetch existing time logs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTimeLogs();
    }, [date]);

    // Convert time strings to minutes since midnight for the slider
    const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Convert minutes since midnight to time string
    const minutesToTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Check if a time range overlaps with existing time logs
    const isTimeRangeOverlapping = (start: number, end: number) => {
        return existingTimeLogs.some(log => {
            const logStart = timeToMinutes(log.startTime);
            const logEnd = timeToMinutes(log.endTime);
            return (start < logEnd && end > logStart);
        });
    };

    const handleSliderChange = (_: Event, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            const [newStart, newEnd] = newValue;

            // Check if the new range overlaps with existing time logs
            if (isTimeRangeOverlapping(newStart, newEnd)) {
                toast.error('This time range overlaps with existing time logs');
                return;
            }

            onStartTimeChange(minutesToTime(newStart));
            onEndTimeChange(minutesToTime(newEnd));
        }
    };

    const formatTimeLabel = (minutes: number) => {
        return minutesToTime(minutes);
    };

    // Create marks for the slider to show existing time logs
    const marks = existingTimeLogs.flatMap(log => [
        { value: timeToMinutes(log.startTime), label: log.startTime },
        { value: timeToMinutes(log.endTime), label: log.endTime }
    ]);

    // Create disabled ranges for the slider
    const getDisabledRanges = () => {
        return existingTimeLogs.map(log => ({
            start: timeToMinutes(log.startTime),
            end: timeToMinutes(log.endTime),
            utilization: log.utilization
        }));
    };

    // Find the nearest available range for a given time
    const findNearestAvailableRange = (clickedMinutes: number) => {
        // Sort all time boundaries (start and end of existing logs)
        const boundaries = existingTimeLogs.flatMap(log => [
            timeToMinutes(log.startTime),
            timeToMinutes(log.endTime)
        ]).sort((a, b) => a - b);

        // Add start and end of day
        boundaries.unshift(0);
        boundaries.push(24 * 60);

        // Find the largest available range that contains the clicked time
        let bestRange = { start: 0, end: 24 * 60 };
        let maxRangeSize = 0;

        for (let i = 0; i < boundaries.length - 1; i++) {
            const start = boundaries[i];
            const end = boundaries[i + 1];

            // Check if this range contains the clicked time and is larger than current best
            if (clickedMinutes >= start && clickedMinutes <= end) {
                const rangeSize = end - start;
                if (rangeSize > maxRangeSize) {
                    maxRangeSize = rangeSize;
                    bestRange = { start, end };
                }
            }
        }

        return bestRange;
    };

    // Handle click on the track
    const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const track = event.currentTarget;
        const rect = track.getBoundingClientRect();
        const clickPosition = event.clientX - rect.left;
        const percentage = clickPosition / rect.width;
        const clickedMinutes = Math.round(percentage * 24 * 60);

        // Check if clicked on a disabled range
        const isClickOnDisabledRange = existingTimeLogs.some(log => {
            const logStart = timeToMinutes(log.startTime);
            const logEnd = timeToMinutes(log.endTime);
            return clickedMinutes >= logStart && clickedMinutes <= logEnd;
        });

        if (isClickOnDisabledRange) {
            toast.error('Cannot select time from an occupied slot');
            return;
        }

        // Find the nearest available range
        const { start, end } = findNearestAvailableRange(clickedMinutes);

        // If the range is too small (less than 15 minutes), don't select it
        if (end - start < 15) {
            toast.error('Selected time range is too small');
            return;
        }

        // Update the time range
        onStartTimeChange(minutesToTime(start));
        onEndTimeChange(minutesToTime(end));
    };

    // Custom track component to show disabled ranges
    const CustomTrack = (props: any) => {
        const { children } = props;
        const disabledRanges = getDisabledRanges();

        return (
            <div
                className="relative w-full h-2 bg-gray-200 rounded-full"
            >
                {disabledRanges.map((range, index) => (
                    <div
                        key={index}
                        className={cn(
                            "absolute h-full",
                            utilizationColors[range.utilization as keyof typeof utilizationColors]
                        )}
                        style={{
                            left: `${(range.start / (24 * 60)) * 100}%`,
                            width: `${((range.end - range.start) / (24 * 60)) * 100}%`,
                        }}
                    />
                ))}
                <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={handleTrackClick}
                />
                {children}
            </div>
        );
    };

    return (
        <div className="relative">
            <Button
                type="button"
                variant="outline"
                className="w-full h-11 flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{startTime} - {endTime}</span>
                </div>
                <Calendar className="h-4 w-4 opacity-50" />
            </Button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-popover border rounded-md shadow-lg p-6">
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center text-sm text-muted-foreground">
                                Loading existing time logs...
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Start: {startTime}</span>
                                    <span>End: {endTime}</span>
                                </div>
                                {existingTimeLogs.length > 0 && (
                                    <div className="text-xs text-muted-foreground mb-2">
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            {Object.entries(utilizationColors).map(([util, color]) => (
                                                <div key={util} className="flex items-center gap-2">
                                                    <div className={cn("w-3 h-3 rounded-sm", color)}></div>
                                                    <span>{util.charAt(0) + util.slice(1).toLowerCase()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Click on any available (gray) section to select that time range
                                        </div>
                                        {existingTimeLogs.map(log =>
                                            `${log.startTime}-${log.endTime}`
                                        ).join(', ')}
                                    </div>
                                )}
                                <TimeSlider
                                    value={[startMinutes, endMinutes]}
                                    onChange={handleSliderChange}
                                    valueLabelDisplay="auto"
                                    valueLabelFormat={formatTimeLabel}
                                    min={0}
                                    max={24 * 60}
                                    step={15}
                                    disableSwap
                                    marks={marks}
                                    components={{
                                        Track: CustomTrack
                                    }}
                                    sx={{
                                        '& .MuiSlider-thumb': {
                                            '&:hover, &.Mui-focusVisible': {
                                                boxShadow: '0px 0px 0px 8px rgb(0 0 0 / 0.1)',
                                            },
                                        },
                                        '& .MuiSlider-mark': {
                                            backgroundColor: 'black',
                                            height: 8,
                                            width: 1.1,
                                            '&.MuiSlider-markActive': {
                                                backgroundColor: 'black',
                                            },
                                        },
                                    }}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>00:00</span>
                                    <span>12:00</span>
                                    <span>24:00</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function TimeLogForm() {
    const router = useRouter();
    const currentDateTime = useMemo(() => getCurrentDateTime(), []);

    const form = useForm<TimeLogFormValues>({
        resolver: zodResolver(timeLogSchema),
        defaultValues: {
            date: currentDateTime.date,
            startTime: currentDateTime.time,
            endTime: currentDateTime.time,
            description: "",
            utilization: "NEUTRAL",
        },
    });

    // Watch start time to update end time validation
    const startTime = form.watch("startTime");
    const endTime = form.watch("endTime");
    const date = form.watch("date");

    // Update end time if it becomes less than start time
    useEffect(() => {
        if (startTime && endTime && date) {
            const start = new Date(`${date}T${startTime}`);
            const end = new Date(`${date}T${endTime}`);
            if (end < start) {
                form.setValue("endTime", startTime, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
                toast.error("End time cannot be before start time");
            }
        }
    }, [startTime, endTime, date, form]);

    async function onSubmit(data: TimeLogFormValues) {
        try {
            const response = await fetch("/api/time-log", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle different types of errors
                if (response.status === 401) {
                    toast.error("Please log in to create a time log");
                    router.push("/auth/login");
                    return;
                }

                if (response.status === 422) {
                    // Handle validation errors
                    const errorMessage = result.errors?.[0]?.message || result.message || "Invalid input data";
                    toast.error(errorMessage);
                    return;
                }

                // Handle other errors
                throw new Error(result.message || "Failed to create time log");
            }

            toast.success("Time log created successfully");
            router.push("/dashboard");
        } catch (error) {
            console.error("Time log error:", error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unexpected error occurred while creating the time log");
            }
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Log Your Time</CardTitle>
                <CardDescription>
                    Record your work hours and track your productivity. You can log time for any period.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Date
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal h-11",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(new Date(field.value), "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => date && field.onChange(format(date, "yyyy-MM-dd"))}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field: startField }) => (
                                    <FormField
                                        control={form.control}
                                        name="endTime"
                                        render={({ field: endField }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Time Range
                                                </FormLabel>
                                                <FormControl>
                                                    <TimeRangePicker
                                                        startTime={startField.value}
                                                        endTime={endField.value}
                                                        date={form.watch("date")}
                                                        onStartTimeChange={(time) => {
                                                            startField.onChange(time);
                                                            if (time > endField.value) {
                                                                endField.onChange(time);
                                                            }
                                                        }}
                                                        onEndTimeChange={(time) => {
                                                            if (time < startField.value) {
                                                                toast.error("End time cannot be before start time");
                                                                return;
                                                            }
                                                            endField.onChange(time);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Description
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="What did you work on? Be specific about your tasks and achievements."
                                                className="resize-none min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="utilization"
                                render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <FormLabel className="flex items-center gap-2">
                                            <Activity className="h-4 w-4" />
                                            How well did you utilize your time?
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="grid grid-cols-4 gap-4"
                                            >
                                                <FormItem>
                                                    <FormControl>
                                                        <RadioGroupItem
                                                            value="SLEEP"
                                                            className="peer sr-only"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                        <span className="text-2xl">💤</span>
                                                        <span className="mt-2 font-medium">Sleep</span>
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem>
                                                    <FormControl>
                                                        <RadioGroupItem
                                                            value="GOOD"
                                                            className="peer sr-only"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                        <span className="text-2xl">🟩</span>
                                                        <span className="mt-2 font-medium">Good</span>
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem>
                                                    <FormControl>
                                                        <RadioGroupItem
                                                            value="NEUTRAL"
                                                            className="peer sr-only"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                        <span className="text-2xl">🟨</span>
                                                        <span className="mt-2 font-medium">Neutral</span>
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem>
                                                    <FormControl>
                                                        <RadioGroupItem
                                                            value="BAD"
                                                            className="peer sr-only"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                        <span className="text-2xl">🟥</span>
                                                        <span className="mt-2 font-medium">Bad</span>
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium"
                            size="lg"
                        >
                            Submit Time Log
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
} 