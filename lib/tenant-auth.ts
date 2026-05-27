import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const secret = new TextEncoder().encode(
  process.env.TENANT_JWT_SECRET ?? (() => { throw new Error("TENANT_JWT_SECRET env var is not set"); })()
);

export interface TenantSession {
  tenantId: string;
  leaseId: string;
  landlordId: string;
}

export async function signTenantToken(payload: TenantSession): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyTenantToken(token: string): Promise<TenantSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as TenantSession;
  } catch {
    return null;
  }
}

export async function getTenantUser(): Promise<TenantSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("tenant_session")?.value;
  if (!token) return null;
  return verifyTenantToken(token);
}

export async function requireTenantUser(): Promise<TenantSession> {
  const session = await getTenantUser();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/tenant-portal/auth");
    throw new Error("Redirecting");
  }
  return session;
}

export async function sendTenantPortalInvite(tenantId: string, leaseId: string, landlordId: string) {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const token = await signTenantToken({ tenantId, leaseId, landlordId });

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: { unit: { include: { property: true } } },
  });
  const landlord = await prisma.landlord.findUnique({ where: { id: landlordId } });

  if (!tenant?.email || !lease || !landlord) return;

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tenant-portal/auth?token=${token}`;
  const address = `${lease.unit.property.address}, Unit ${lease.unit.unitNumber}`;

  await prisma.tenant.update({ where: { id: tenantId }, data: { portalToken: token } });

  const { emailBase, greeting, ep, emailList, btn, muted } = await import("./email");
  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: tenant.email,
    subject: `Your RentNest tenant portal — ${address}`,
    html: emailBase(
      greeting(tenant.name) +
      ep(`<strong>${landlord.name}</strong> has invited you to manage your rental at <strong>${address}</strong> through RentNest.`) +
      ep("Your tenant portal lets you:") +
      emailList([
        "Pay rent online by bank transfer or card",
        "Submit and track maintenance requests",
        "View your lease documents",
        "Message your landlord directly",
      ]) +
      btn("Access Your Tenant Portal →", portalUrl) +
      muted("This link logs you in automatically — treat it like a password and keep it private.")
    ),
  });
}
