// For now, this is a client component using mock data.
// When you connect Supabase, this becomes a Server Component
// that calls prisma queries from lib.ts and passes data as props.

// ─────────────────────────────────────
// TODO: Replace with real data fetching:
//
// import { prisma, getProjectsForUser, getDashboardStats } from "@/lib";
// import { createSupabaseServerClient } from "@/supabase-server";
//
// export default async function DashboardPage() {
//   const supabase = createSupabaseServerClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   const projects = await getProjectsForUser(user!.id);
//   const stats = await getDashboardStats(user!.id);
//   return <DashboardShell projects={projects} stats={stats} />;
// }
// ─────────────────────────────────────

"use client";

export { default } from "./dashboard-client";
