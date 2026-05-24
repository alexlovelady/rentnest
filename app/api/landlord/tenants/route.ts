import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json([], { status: 401 });

  const tenants = await prisma.tenant.findMany({
    where: { landlordId: user.id, isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(tenants);
}
