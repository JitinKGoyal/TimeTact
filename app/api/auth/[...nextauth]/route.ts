import NextAuth from "next-auth/next";
import { authConfig } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Create the handler
const handler = NextAuth(authConfig);

export { handler as GET, handler as POST }; 