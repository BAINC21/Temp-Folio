import { prisma } from "@/lib";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test 1: Can Prisma connect at all?
    const userCount = await prisma.user.count();
    
    // Test 2: Can we read data?
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true },
      take: 5,
    });

    return NextResponse.json({
      status: "connected",
      userCount,
      users,
      databaseUrl: process.env.DATABASE_URL
        ? `${process.env.DATABASE_URL.substring(0, 30)}...` // Show first 30 chars only
        : "NOT SET",
      directUrl: process.env.DIRECT_URL ? "SET" : "NOT SET",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      status: "failed",
      error: message,
      databaseUrl: process.env.DATABASE_URL
        ? `${process.env.DATABASE_URL.substring(0, 30)}...`
        : "NOT SET",
      directUrl: process.env.DIRECT_URL ? "SET" : "NOT SET",
    }, { status: 500 });
  }
}
