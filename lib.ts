import { PrismaClient } from "@prisma/client";
import { createBrowserClient } from "@supabase/ssr";

// ─────────────────────────────────────
// Prisma (database queries)
// ─────────────────────────────────────
// Singleton pattern prevents creating multiple connections in dev mode
// (Next.js hot-reloads clear module cache, which would leak connections)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─────────────────────────────────────
// Supabase (auth + file storage)
// ─────────────────────────────────────
// Browser client — used in client components for auth & file uploads

export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─────────────────────────────────────
// Helper types & utils
// ─────────────────────────────────────

export type ProjectWithClient = Awaited<
  ReturnType<typeof getProjectsForUser>
>[number];

// Example typed query — use this pattern for all your data fetching
export async function getProjectsForUser(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    include: { client: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProjectDetail(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      milestones: { orderBy: { sortOrder: "asc" } },
      files: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export async function getClientPortal(slug: string) {
  return prisma.client.findUnique({
    where: { portalSlug: slug },
    include: {
      projects: {
        include: {
          milestones: { orderBy: { sortOrder: "asc" } },
          files: {
            where: { category: "DELIVERABLE" },
            orderBy: { createdAt: "desc" },
          },
        },
      },
      user: { select: { name: true, brandName: true, brandColor: true, brandLogoUrl: true } },
    },
  });
}

export async function getDashboardStats(userId: string) {
  const [projectCount, clientCount, invoices] = await Promise.all([
    prisma.project.count({ where: { userId, status: { in: ["ACTIVE", "IN_REVIEW"] } } }),
    prisma.client.count({ where: { userId } }),
    prisma.invoice.findMany({
      where: { userId },
      select: { amountTotal: true, status: true, paidDate: true },
    }),
  ]);

  const revenue = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + Number(i.amountTotal), 0);

  const outstanding = invoices
    .filter((i) => i.status !== "PAID" && i.status !== "CANCELLED")
    .reduce((sum, i) => sum + Number(i.amountTotal), 0);

  return { projectCount, clientCount, revenue, outstanding };
}

// Supabase Storage helpers
export function getFileUrl(storagePath: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/project-files/${storagePath}`;
}

export async function uploadFile(
  supabase: ReturnType<typeof createSupabaseClient>,
  file: File,
  projectId: string
) {
  const path = `${projectId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("project-files")
    .upload(path, file);

  if (error) throw error;
  return { storagePath: data.path, name: file.name, mimeType: file.type, sizeBytes: file.size };
}
