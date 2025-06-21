import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        environment: {
            nodeEnv: process.env.NODE_ENV,
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
            hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
            databaseUrlType: process.env.DATABASE_URL?.includes('postgresql') ? 'postgresql' : 'unknown',
            nextAuthUrl: process.env.NEXTAUTH_URL,
        },
        timestamp: new Date().toISOString(),
    });
} 