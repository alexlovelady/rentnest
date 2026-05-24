import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json([], { status: 401 });

  const units = await prisma.unit.findMany({
    where: { property: { landlordId: user.id }, isActive: true },
    include: { property: { select: { address: true } } },
    orderBy: { unitNumber: "asc" },
  });

  return NextResponse.json(units);
}
