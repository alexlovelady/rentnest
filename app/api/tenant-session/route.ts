import { NextRequest, NextResponse } from "next/server";
import { verifyTenantToken } from "@/lib/tenant-auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  const payload = await verifyTenantToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("tenant_session", token, {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.json({ ok: true });
}
