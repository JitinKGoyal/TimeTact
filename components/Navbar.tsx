"use client";

import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Menu } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Don't show navbar on auth pages
    if (pathname.startsWith("/auth/") || status === "unauthenticated") {
        return null;
    }

    return (
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold">
                            <Link href={'/dashboard'} className="whitespace-nowrap">Time Task Management</Link>
                        </h1>
                    </div>

                    {/* Mobile menu */}
                    <div className="md:hidden">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[280px] sm:w-[280px]">
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-4 mt-4">
                                    <Button
                                        onClick={() => {
                                            router.push("/log");
                                            setIsMobileMenuOpen(false);
                                        }}
                                        variant="default"
                                        className="w-full justify-center"
                                    >
                                        Log Time
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            router.push("/profile");
                                            setIsMobileMenuOpen(false);
                                        }}
                                        variant="outline"
                                        className="w-full justify-center"
                                    >
                                        <User className="h-4 w-4 mr-2" />
                                        Profile
                                    </Button>
                                    <div className="w-full flex justify-center">
                                        <LogoutButton />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <Button
                            onClick={() => router.push("/log")}
                            variant="default"
                        >
                            Log Time
                        </Button>
                        <Button
                            onClick={() => router.push("/profile")}
                            variant="outline"
                            size="icon"
                            title="Profile"
                        >
                            <User className="h-4 w-4" />
                        </Button>
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </nav>
    );
} 