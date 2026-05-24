import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json([], { status: 401 });

  const leases = await prisma.lease.findMany({
    where: { landlordId: user.id, status: "active" },
    include: {
      unit: { include: { property: { select: { address: true } } } },
      tenants: { include: { tenant: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(leases);
}
