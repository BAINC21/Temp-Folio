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

export async function createProject(data: {
  title: string;
  clientId: string;
  description?: string;
  dueDate?: string;
}) {
  const user = await getAuthUser();

  const project = await prisma.project.create({
    data: {
      title: data.title,
      clientId: data.clientId,
      userId: user.id,
      description: data.description || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });

  revalidatePath("/");
  return { id: project.id, title: project.title };
}

export async function createClient(data: {
  name: string;
  email: string;
  company?: string;
}) {
  const user = await getAuthUser();

  const portalSlug = (data.company || data.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Date.now().toString(36);

  const client = await prisma.client.create({
    data: {
      name: data.name,
      email: data.email,
      company: data.company || null,
      userId: user.id,
      portalSlug,
    },
  });

  revalidatePath("/clients");
  revalidatePath("/");
  return { id: client.id, name: client.name };
}

export async function createInvoice(data: {
  clientId: string;
  amount: string;
  dueDate: string;
  description?: string;
}) {
  const user = await getAuthUser();

  const count = await prisma.invoice.count({ where: { userId: user.id } });
  const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;
  const amountNum = parseFloat(data.amount.replace(/[$,]/g, ""));

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: data.clientId,
      invoiceNumber,
      amountTotal: amountNum,
      dueDate: new Date(data.dueDate),
      lineItems: {
        create: [{
          description: data.description || "Services",
          quantity: 1,
          unitPrice: amountNum,
          total: amountNum,
        }],
      },
    },
  });

  revalidatePath("/invoices");
  revalidatePath("/");
  return { id: invoice.id, invoiceNumber };
}

export async function updateSettings(data: {
  name?: string;
  brandName?: string;
  brandColor?: string;
}) {
  const user = await getAuthUser();

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.brandName !== undefined ? { brandName: data.brandName } : {}),
      ...(data.brandColor !== undefined ? { brandColor: data.brandColor } : {}),
    },
  });

  revalidatePath("/settings");
  return { name: updated.name, brandName: updated.brandName, brandColor: updated.brandColor };
}

export async function getLoggedInUser() {
  try {
    const user = await getAuthUser();
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, brandName: true, brandColor: true, brandLogoUrl: true, plan: true },
    });
    return dbUser;
  } catch {
    return null;
  }
}

export async function getUserClients() {
  const user = await getAuthUser();
  return prisma.client.findMany({
    where: { userId: user.id },
    include: {
      projects: { select: { id: true, title: true, status: true, progress: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserInvoices() {
  const user = await getAuthUser();
  return prisma.invoice.findMany({
    where: { userId: user.id },
    include: {
      client: { select: { name: true, company: true } },
      lineItems: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
