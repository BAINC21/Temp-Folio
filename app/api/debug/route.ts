import { prisma } from "@/lib";
import { createSupabaseServerClient } from "@/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Test 1: Database connection
  try {
    const userCount = await prisma.user.count();
    const clientCount = await prisma.client.count();
    const projectCount = await prisma.project.count();
    results.connection = "OK";
    results.counts = { users: userCount, clients: clientCount, projects: projectCount };
  } catch (error: unknown) {
    results.connection = "FAILED";
    results.connectionError = error instanceof Error ? error.message : String(error);
    return NextResponse.json(results, { status: 500 });
  }

  // Test 2: Auth user
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      results.authUser = { id: user.id, email: user.email };
    } else {
      results.authUser = "NOT LOGGED IN";
    }
  } catch (error: unknown) {
    results.authUser = "FAILED";
    results.authError = error instanceof Error ? error.message : String(error);
  }

  // Test 3: Prisma user row
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true },
    });
    results.prismaUsers = users;
  } catch (error: unknown) {
    results.prismaUsers = "FAILED";
    results.prismaUserError = error instanceof Error ? error.message : String(error);
  }

  // Test 4: Clients with IDs
  try {
    const clients = await prisma.client.findMany({
      select: { id: true, name: true, company: true, userId: true },
    });
    results.clients = clients;
  } catch (error: unknown) {
    results.clients = "FAILED";
    results.clientError = error instanceof Error ? error.message : String(error);
  }

  // Test 5: Try creating a test project (if there's at least one client)
  try {
    const firstClient = await prisma.client.findFirst();
    const firstUser = await prisma.user.findFirst();
    if (firstClient && firstUser) {
      const project = await prisma.project.create({
        data: {
          title: "DEBUG TEST PROJECT",
          clientId: firstClient.id,
          userId: firstUser.id,
          description: "Auto-created by debug route — safe to delete",
        },
      });
      results.testProject = { success: true, id: project.id, title: project.title };
    } else {
      results.testProject = "SKIPPED — no client or user found";
    }
  } catch (error: unknown) {
    results.testProject = "FAILED";
    results.projectError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(results, { status: 200 });
}
