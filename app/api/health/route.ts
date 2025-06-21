import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Test database connection
        await prisma.$connect();

        // Test a simple query
        const userCount = await prisma.user.count();

        return NextResponse.json({
            status: "healthy",
            database: "connected",
            userCount,
            environment: {
                nodeEnv: process.env.NODE_ENV,
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
                hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
                databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "...",
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Health check error:', error);

        return NextResponse.json({
            status: "unhealthy",
            error: error instanceof Error ? error.message : "Unknown error",
            environment: {
                nodeEnv: process.env.NODE_ENV,
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
                hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
                databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "...",
            },
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
} 