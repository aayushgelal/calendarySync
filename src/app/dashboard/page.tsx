import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { NextAuthOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(NextAuthOptions);

  if (!session) {
    redirect("/");
  }

  // If logged in, redirect to dashboard/syncs
  redirect("/dashboard/syncs");
}