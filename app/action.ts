"use server";

// ═══════════════════════════════════════
// SERVER ACTIONS — Prisma mutation scaffolding
// These are ready to wire once auth is connected.
// Each action should:
//   1. Get the current user from Supabase session
//   2. Validate input
//   3. Run Prisma mutation
//   4. Revalidate the relevant path
// ═══════════════════════════════════════

// import { prisma } from "@/lib";
// import { createSupabaseServerClient } from "@/supabase-server";
// import { revalidatePath } from "next/cache";

export async function createProject(data: {
  title: string;
  clientId: string;
  description?: string;
  dueDate?: string;
}) {
  // TODO: Wire to Prisma
  // const supabase = createSupabaseServerClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) throw new Error("Unauthorized");
  //
  // const project = await prisma.project.create({
  //   data: {
  //     title: data.title,
  //     clientId: data.clientId,
  //     userId: user.id,
  //     description: data.description,
  //     dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
  //   },
  // });
  //
  // revalidatePath("/");
  // return project;

  console.log("createProject:", data);
  return { id: "mock-" + Date.now(), ...data };
}

export async function createClient(data: {
  name: string;
  email: string;
  company?: string;
}) {
  // TODO: Wire to Prisma
  // const supabase = createSupabaseServerClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) throw new Error("Unauthorized");
  //
  // const portalSlug = data.company
  //   ? data.company.toLowerCase().replace(/\s+/g, "-")
  //   : data.email.split("@")[0];
  //
  // const client = await prisma.client.create({
  //   data: {
  //     name: data.name,
  //     email: data.email,
  //     company: data.company,
  //     userId: user.id,
  //     portalSlug,
  //   },
  // });
  //
  // revalidatePath("/clients");
  // return client;

  console.log("createClient:", data);
  return { id: "mock-" + Date.now(), ...data };
}

export async function createInvoice(data: {
  clientId: string;
  amount: string;
  dueDate: string;
  description?: string;
}) {
  // TODO: Wire to Prisma
  // const supabase = createSupabaseServerClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) throw new Error("Unauthorized");
  //
  // const count = await prisma.invoice.count({ where: { userId: user.id } });
  // const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;
  //
  // const invoice = await prisma.invoice.create({
  //   data: {
  //     userId: user.id,
  //     clientId: data.clientId,
  //     invoiceNumber,
  //     amountTotal: parseFloat(data.amount.replace(/[$,]/g, "")),
  //     dueDate: new Date(data.dueDate),
  //     lineItems: {
  //       create: [{
  //         description: data.description || "Services",
  //         quantity: 1,
  //         unitPrice: parseFloat(data.amount.replace(/[$,]/g, "")),
  //         total: parseFloat(data.amount.replace(/[$,]/g, "")),
  //       }],
  //     },
  //   },
  // });
  //
  // revalidatePath("/invoices");
  // return invoice;

  console.log("createInvoice:", data);
  return { id: "mock-" + Date.now(), ...data };
}

export async function updateSettings(data: {
  name?: string;
  brandName?: string;
  brandColor?: string;
}) {
  // TODO: Wire to Prisma
  // const supabase = createSupabaseServerClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) throw new Error("Unauthorized");
  //
  // const updated = await prisma.user.update({
  //   where: { id: user.id },
  //   data: {
  //     name: data.name,
  //     brandName: data.brandName,
  //     brandColor: data.brandColor,
  //   },
  // });
  //
  // revalidatePath("/settings");
  // return updated;

  console.log("updateSettings:", data);
  return data;
}
