"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Session } from "next-auth";

export function UserProfile() {
    const { data: session, status } = useSession() as { data: Session | null; status: string };

    if (status === "loading") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Profile Information</CardTitle>
                    <CardDescription>View and manage your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-sm font-medium text-muted-foreground">Name</div>
                        <div className="col-span-2">
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-sm font-medium text-muted-foreground">Email</div>
                        <div className="col-span-2">
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!session?.user) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Profile Information</CardTitle>
                <CardDescription>View and manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                    <div className="col-span-2 text-sm">
                        {session.user.name || "Not provided"}
                    </div>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                    <div className="col-span-2 text-sm">
                        {session.user.email}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 