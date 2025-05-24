import { TimeLogForm } from "@/components/TimeLogForm";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";
import type { Session } from "next-auth";

export default async function TimeLogPage() {
    const session = (await getServerSession(authConfig)) as Session | null;

    if (!session) {
        redirect("/auth/login");
    }

    return (
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
                                <Clock className="h-5 w-5 text-primary" />
                                <h1 className="text-xl font-semibold">Time Log</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold tracking-tight">Log Your Time</h2>
                        <p className="text-muted-foreground mt-2">
                            Track your work hours and productivity to better manage your time.
                        </p>
                    </div>

                    <div className="bg-card rounded-lg shadow-sm">
                        <TimeLogForm />
                    </div>

                    {/* Quick Tips */}
                    <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-medium mb-2">Quick Tips</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>• Be specific in your description to better track your work</li>
                            <li>• Use the utilization rating to reflect on your productivity</li>
                            <li>• Log your time as soon as possible for better accuracy</li>
                        </ul>
                    </div>
                </div>
            </main>

            <Toaster />
        </div>
    );
} 