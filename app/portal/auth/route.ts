import { prisma } from "@/lib";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`);
  }

  const client = await prisma.client.findUnique({ where: { magicLinkToken: token } });

  if (!client) {
    return NextResponse.redirect(`${origin}/login?error=invalid_token`);
  }

  if (client.magicLinkExp && client.magicLinkExp < new Date()) {
    return NextResponse.redirect(`${origin}/login?error=expired_token`);
  }

  // Update last login
  await prisma.client.update({ where: { id: client.id }, data: { lastLogin: new Date() } });

  // Redirect to their portal
  return NextResponse.redirect(`${origin}/portal/${client.portalSlug}`);
}
