import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authConfig } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authConfig);

  // Redirect to dashboard if authenticated, otherwise to login
  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/auth/login");
  }

  // This won't be rendered due to the redirects above
  return null;
}
