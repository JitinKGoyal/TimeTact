import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Extend the built-in session types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }
}

type JWTCallback = {
    token: JWT;
    user?: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
};

type SessionCallback = {
    token: JWT;
    session: Session;
};

// Export the auth config with type assertion
export const authConfig = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                if (!user || !user?.password) {
                    throw new Error("Invalid credentials");
                }

                const isCorrectPassword = await compare(
                    credentials.password,
                    user.password
                );

                if (!isCorrectPassword) {
                    throw new Error("Invalid credentials");
                }

                return user;
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    secret: "process.env.NEXTAUTH_SECRET",
    debug: process.env.NODE_ENV === "development",
    pages: {
        signIn: "/auth/login"
    },
    callbacks: {
        async session({ token, session }: SessionCallback) {
            if (token) {
                session.user.id = token.id as string;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
            }

            return session;
        },
        async jwt({ token, user }: JWTCallback) {
            const dbUser = await prisma.user.findFirst({
                where: {
                    email: token.email!,
                },
            });

            if (!dbUser) {
                if (user) {
                    token.id = user.id;
                }
                return token;
            }

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
            };
        },
    },
} as any; 