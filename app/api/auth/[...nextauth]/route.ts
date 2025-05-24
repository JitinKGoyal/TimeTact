import NextAuth from "next-auth/next";
import { authConfig } from "@/lib/auth";

// Create the handler
const handler = NextAuth(authConfig);

export { handler as GET, handler as POST }; 