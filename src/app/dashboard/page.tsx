import { redirect } from "next/navigation";
import { NextAuthOptions } from '@/utils/authOptions';

export default async function DashboardPage() {
  // If logged in, redirect to dashboard/syncs
  redirect("/dashboard/syncs");
}