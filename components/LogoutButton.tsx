"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        await signOut({ redirect: false });
        router.push("/auth/login");
    };

    return (
        <Button variant="outline" onClick={handleLogout} disabled={loading}>
            {loading ? "Logging out..." : "Logout"}
        </Button>
    );
} 