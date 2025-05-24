// This file contains type declarations for NextAuth
// No imports needed as we're just extending existing types

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        name?: string | null;
        email?: string | null;
        picture?: string | null;
    }
} 