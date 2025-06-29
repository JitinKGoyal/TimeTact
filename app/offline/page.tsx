'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <WifiOff className="h-8 w-8 text-gray-600" />
                    </div>
                    <CardTitle>You&apos;re Offline</CardTitle>
                    <CardDescription>
                        Please check your internet connection and try again.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button onClick={handleRetry} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
} 