import NextAuth from "next-auth/next";
import { authConfig } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Create the handler with error handling
const handler = NextAuth(authConfig);

// Wrap the handler with error handling
async function authHandler(req: Request, context: any) {
    try {
        return await handler(req, context);
    } catch (error) {
        console.error('NextAuth error:', error);

        // Return a proper error response
        return new Response(
            JSON.stringify({
                error: 'Authentication error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

export { authHandler as GET, authHandler as POST }; 