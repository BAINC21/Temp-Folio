"use server";

import { prisma } from "@/lib";
import { createSupabaseServerClient } from "@/supabase-server";
import { revalidatePath } from "next/cache";

async function getAuthUser() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

async function ensureDbUser() {
  const authUser = await getAuthUser();
  const existing = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      id: authUser.id,
      email: authUser.email!,
      name: authUser.user_metadata?.name || authUser.email!.split("@")[0],
    },
  });
}

export async function getLoggedInUser() {
  try {
    const user = await ensureDbUser();
    return {
      id: user.id, email: user.email, name: user.name,
      brandName: user.brandName, brandColor: user.brandColor,
      brandLogoUrl: user.brandLogoUrl, plan: user.plan,
    };
  } catch { return null; }
}

// ─── Clients ───
export async function getUserClients() {
  const user = await ensureDbUser();
  return prisma.client.findMany({
    where: { userId: user.id },
    include: { projects: { where: { deletedAt: null }, select: { id: true, title: true, status: true, progress: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createClient(data: { name: string; email: string; company?: string; phone?: string }) {
  const user = await ensureDbUser();
  const portalSlug = (data.company || data.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
  const client = await prisma.client.create({
    data: { name: data.name, email: data.email, company: data.company || null, phone: data.phone || null, userId: user.id, portalSlug },
  });
  revalidatePath("/clients");
  revalidatePath("/");
  return { success: true, id: client.id, name: client.name, company: client.company };
}

export async function deleteClient(clientId: string) {
  const user = await ensureDbUser();
  // Verify ownership
  const client = await prisma.client.findFirst({ where: { id: clientId, userId: user.id } });
  if (!client) throw new Error("Client not found");
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/clients");
  revalidatePath("/");
  return { success: true };
}

// ─── Projects ───
export async function getUserProjects() {
  const user = await ensureDbUser();
  return prisma.project.findMany({
    where: { userId: user.id, deletedAt: null },
    include: { client: { select: { id: true, name: true, company: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createProject(data: { title: string; clientId: string; description?: string; dueDate?: string }) {
  const user = await ensureDbUser();
  const project = await prisma.project.create({
    data: { title: data.title, clientId: data.clientId, userId: user.id, description: data.description || null, dueDate: data.dueDate ? new Date(data.dueDate) : null },
  });
  revalidatePath("/");
  return { success: true, id: project.id, title: project.title };
}

export async function softDeleteProject(projectId: string) {
  const user = await ensureDbUser();
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) throw new Error("Project not found");
  await prisma.project.update({ where: { id: projectId }, data: { deletedAt: new Date() } });
  revalidatePath("/");
  return { success: true };
}

export async function restoreProject(projectId: string) {
  const user = await ensureDbUser();
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) throw new Error("Project not found");
  await prisma.project.update({ where: { id: projectId }, data: { deletedAt: null } });
  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}

export async function getDeletedItems() {
  const user = await ensureDbUser();
  const projects = await prisma.project.findMany({
    where: { userId: user.id, deletedAt: { not: null } },
    include: { client: { select: { name: true, company: true } } },
    orderBy: { deletedAt: "desc" },
  });
  return projects;
}

export async function permanentlyDeleteProject(projectId: string) {
  const user = await ensureDbUser();
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) throw new Error("Project not found");
  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath("/settings");
  return { success: true };
}

// ─── Invoices ───
export async function createInvoice(data: { clientId: string; amount: string; dueDate: string; description?: string }) {
  const user = await ensureDbUser();
  const count = await prisma.invoice.count({ where: { userId: user.id } });
  const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;
  const amountNum = parseFloat(data.amount.replace(/[$,]/g, ""));
  if (isNaN(amountNum) || amountNum <= 0) throw new Error("Invalid amount");
  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id, clientId: data.clientId, invoiceNumber, amountTotal: amountNum, dueDate: new Date(data.dueDate),
      lineItems: { create: [{ description: data.description || "Services", quantity: 1, unitPrice: amountNum, total: amountNum }] },
    },
  });
  revalidatePath("/invoices");
  revalidatePath("/");
  return { success: true, id: invoice.id, invoiceNumber };
}

// ─── Settings ───
export async function updateSettings(data: { name?: string; brandName?: string; brandColor?: string }) {
  const user = await ensureDbUser();
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.brandName !== undefined ? { brandName: data.brandName } : {}),
      ...(data.brandColor !== undefined ? { brandColor: data.brandColor } : {}),
    },
  });
  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true, name: updated.name, brandName: updated.brandName, brandColor: updated.brandColor };
}

// ─── Dashboard Stats ───
export async function getDashboardData() {
  const user = await ensureDbUser();
  const [projects, clients, invoices] = await Promise.all([
    prisma.project.findMany({
      where: { userId: user.id, deletedAt: null },
      include: { client: { select: { id: true, name: true, company: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.client.count({ where: { userId: user.id } }),
    prisma.invoice.findMany({
      where: { userId: user.id },
      select: { amountTotal: true, status: true },
    }),
  ]);
  const activeProjects = projects.filter(p => p.status === "ACTIVE" || p.status === "IN_REVIEW").length;
  const revenue = invoices.filter(i => i.status === "PAID").reduce((s, i) => s + Number(i.amountTotal), 0);
  const outstanding = invoices.filter(i => i.status !== "PAID" && i.status !== "CANCELLED").reduce((s, i) => s + Number(i.amountTotal), 0);
  return { projects, activeProjects, clientCount: clients, revenue, outstanding };
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
