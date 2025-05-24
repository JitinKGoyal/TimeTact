"use client";

import { Providers } from "@/components/Providers";
import { TimeLogsList } from "@/components/TimeLogsList";
import { TimeUtilizationChart } from "@/components/TimeUtilizationChart";
import { useState } from "react";

export default function DashboardPage() {
    const [date, setDate] = useState<Date>(new Date());

    return (
        <Providers>
            <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid gap-8">
                        <TimeUtilizationChart date={date} />
                        <TimeLogsList date={date} onDateChange={setDate} />
                    </div>
                </div>
            </div>
        </Providers>
    );
} 