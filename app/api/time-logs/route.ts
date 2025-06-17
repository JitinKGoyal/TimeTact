import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = (await getServerSession(authConfig)) as Session | null;

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: "You must be logged in to view time logs" },
                { status: 401 }
            );
        }

        // Get the date from query params
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get("date");

        if (!dateStr) {
            return NextResponse.json(
                { message: "Date parameter is required" },
                { status: 400 }
            );
        }

        // Parse the date and create start/end of day
        const date = new Date(dateStr);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

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

        // Fetch time logs for the specified date
        const timeLogs = await prisma.timeLog.findMany({
            where: {
                userId: user.id,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: {
                startTime: "asc",
            },
        });

        return NextResponse.json(timeLogs);
    } catch (error) {
        console.error("[TIME_LOGS_GET]", error);

        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "An unexpected error occurred while fetching time logs" },
            { status: 500 }
        );
    }
} 