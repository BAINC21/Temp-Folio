import { prisma } from "@/lib";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { id, email, name } = await request.json();

    if (!id || !email) {
      return NextResponse.json({ error: "Missing id or email" }, { status: 400 });
    }

    // Upsert: create if new, update email/name if existing
    const user = await prisma.user.upsert({
      where: { id },
      create: {
        id,
        email,
        name: name || email.split("@")[0],
      },
      update: {
        email,
        // Only update name if provided and user doesn't have one yet
        ...(name ? { name } : {}),
      },
    });

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error("Auth sync error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
