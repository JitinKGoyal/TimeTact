import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Session } from "next-auth";
import { format } from "date-fns";
import { Utilization } from "@prisma/client";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const timeLogSchema = z.object({
    date: z.string().min(1),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    description: z.string().min(1),
    utilization: z.nativeEnum(Utilization),
});

export async function POST(req: Request) {
    try {
        const session = (await getServerSession(authConfig)) as Session | null;

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "You must be logged in to create a time log" },
                { status: 401 }
            );
        }

        const json = await req.json();
        const body = timeLogSchema.parse(json);

        // Get the user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User account not found" },
                { status: 404 }
            );
        }

        // Validate times
        const startTime = new Date(`${body.date}T${body.startTime}`);
        const endTime = new Date(`${body.date}T${body.endTime}`);

        if (endTime < startTime) {
            return NextResponse.json(
                { message: "End time must be after start time" },
                { status: 400 }
            );
        }

        // Create time log
        const timeLog = await prisma.timeLog.create({
            data: {
                userId: user.id,
                startTime: startTime,
                endTime: endTime,
                description: body.description,
                utilization: body.utilization,
            },
        });

        return NextResponse.json(timeLog);
    } catch (error) {
        console.error("[TIME_LOG_POST]", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    message: "Invalid input data",
                    errors: error.issues
                },
                { status: 422 }
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "An unexpected error occurred while creating the time log" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authConfig) as Session & { user: { id: string } };
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const date = searchParams.get("date");

        if (!date) {
            return NextResponse.json({ error: "Date is required" }, { status: 400 });
        }

        // Create start and end of the requested date
        const startOfDay = new Date(`${date}T00:00:00`);
        const endOfDay = new Date(`${date}T23:59:59`);

        const timeLogs = await prisma.timeLog.findMany({
            where: {
                userId: session.user.id,
                startTime: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            },
            select: {
                startTime: true,
                endTime: true,
                utilization: true,
            },
            orderBy: {
                startTime: 'asc',
            },
        });

        // Format the times to HH:mm format for the frontend
        const formattedTimeLogs = timeLogs.map(log => ({
            startTime: format(log.startTime, 'HH:mm'),
            endTime: format(log.endTime, 'HH:mm'),
            utilization: log.utilization
        }));

        return NextResponse.json(formattedTimeLogs);
    } catch (error) {
        console.error("Error fetching time logs:", error);
        return NextResponse.json(
            { error: "Failed to fetch time logs" },
            { status: 500 }
        );
    }
} 