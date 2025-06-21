import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const session = await getServerSession(authConfig);

    // Redirect to dashboard if authenticated, otherwise to login
    if (session) {
      redirect("/dashboard");
    } else {
      redirect("/auth/login");
    }
  } catch {
    // Fallback redirect to login if there's an error
    redirect("/auth/login");
  }

  // This won't be rendered due to the redirects above
  return null;
}
