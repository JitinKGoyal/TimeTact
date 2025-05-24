"use client";

import { Providers } from "@/components/Providers";
import { UserProfile } from "@/components/UserProfile";
import { Button } from "@/components/ui/button";
import { ChevronLeft, User } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    return (
        <Providers>
            <div className="min-h-screen bg-background">
                {/* Header Section */}
                <div className="border-b">
                    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    <h1 className="text-xl font-semibold">Profile</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid gap-8">
                            <UserProfile />
                        </div>
                    </div>
                </div>
            </div>
        </Providers>
    );
} 