import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, FROM, APP_URL } from "@/lib/resend";
import { applyLateFees } from "@/lib/rent";
import { signTenantToken } from "@/lib/tenant-auth";
import { addDays, isAfter, isBefore, differenceInDays } from "date-fns";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 0. Apply late fees for all landlords with overdue payments
  const activeLandlords = await prisma.landlord.findMany({ where: { plan: { not: "cancelled" } }, select: { id: true } });
  for (const l of activeLandlords) {
    await applyLateFees(l.id);
  }

  // 1. Rent due reminders — 3 days before due
  const upcomingPayments = await prisma.rentPayment.findMany({
    where: {
      status: "pending",
      dueDate: {
        gte: now,
        lte: addDays(now, 3),
      },
    },
    include: {
      tenant: true,
      lease: { include: { unit: { include: { property: true } } } },
    },
  });

  for (const payment of upcomingPayments) {
    if (!payment.tenant?.email) continue;
    const addr = `${payment.lease.unit.property.address}, Unit ${payment.lease.unit.unitNumber}`;
    const token = await signTenantToken({ tenantId: payment.tenantId!, leaseId: payment.leaseId, landlordId: payment.landlordId });
    const portalUrl = `${APP_URL}/tenant-portal/auth?token=${token}`;
    await resend.emails.send({
      from: FROM,
      to: payment.tenant.email,
      subject: `Rent reminder — $${payment.totalAmount.toFixed(2)} due soon`,
      html: `<p>Hi ${payment.tenant.name},</p><p>Your rent of <strong>$${payment.totalAmount.toFixed(2)}</strong> for ${addr} is due on <strong>${payment.dueDate.toLocaleDateString()}</strong>.</p><p><a href="${portalUrl}">Pay Online</a></p>`,
    });
  }

  // 2. Overdue rent — notify landlord and tenant
  const overduePayments = await prisma.rentPayment.findMany({
    where: { status: "pending", dueDate: { lt: now } },
    include: {
      tenant: true,
      lease: { include: { unit: { include: { property: true } } } },
    },
  });

  const landlordOverdue: Record<string, typeof overduePayments> = {};
  for (const payment of overduePayments) {
    const grace = payment.lease.lateFeeGracePeriodDays;
    const gracePassed = isAfter(now, addDays(payment.dueDate, grace));
    if (!gracePassed) continue;

    // Only send overdue tenant reminders on day 1, 7, 14, 30 past grace period to avoid daily spam
    const daysPastGrace = differenceInDays(now, addDays(payment.dueDate, grace));
    const shouldNotify = daysPastGrace === 1 || daysPastGrace === 7 || daysPastGrace === 14 || daysPastGrace === 30;

    if (!landlordOverdue[payment.landlordId]) landlordOverdue[payment.landlordId] = [];
    landlordOverdue[payment.landlordId].push(payment);

    if (shouldNotify && payment.tenant?.email) {
      const addr = `${payment.lease.unit.property.address}, Unit ${payment.lease.unit.unitNumber}`;
      const token = await signTenantToken({ tenantId: payment.tenantId!, leaseId: payment.leaseId, landlordId: payment.landlordId });
      const portalUrl = `${APP_URL}/tenant-portal/auth?token=${token}`;
      await resend.emails.send({
        from: FROM,
        to: payment.tenant.email,
        subject: `Rent overdue — ${addr}`,
        html: `<p>Hi ${payment.tenant.name},</p><p>Your rent of <strong>$${payment.totalAmount.toFixed(2)}</strong> for ${addr} is overdue. Please pay as soon as possible.</p><p><a href="${portalUrl}">Pay Online</a></p>`,
      });
    }
  }

  for (const [landlordId, payments] of Object.entries(landlordOverdue)) {
    const landlord = await prisma.landlord.findUnique({ where: { id: landlordId } });
    if (!landlord?.notifyOnOverdue || !landlord.email) continue;
    const lines = payments.map((p) => `<li>${p.tenant?.name} — ${p.lease.unit.property.address} Unit ${p.lease.unit.unitNumber} — $${p.totalAmount.toFixed(2)}</li>`).join("");
    await resend.emails.send({
      from: FROM,
      to: landlord.email,
      subject: `${payments.length} overdue rent payment(s) need attention`,
      html: `<p>Hi ${landlord.name},</p><p>The following tenants have overdue rent:</p><ul>${lines}</ul><p><a href="${APP_URL}/dashboard/rent">View Rent Dashboard</a></p>`,
    });
  }

  // 3. Lease expiration — 60 and 30 days
  const leases = await prisma.lease.findMany({
    where: { status: "active", endDate: { not: null } },
    include: {
      unit: { include: { property: true } },
      tenants: { include: { tenant: true } },
    },
  });

  for (const lease of leases) {
    if (!lease.endDate) continue;
    const days = differenceInDays(lease.endDate, now);
    if (days !== 60 && days !== 30) continue;

    const landlord = await prisma.landlord.findUnique({ where: { id: lease.landlordId } });
    if (!landlord?.email || !landlord.notifyOnLeaseExpiring) continue;

    const tenantNames = lease.tenants.map((lt) => lt.tenant.name).join(", ");
    const addr = `${lease.unit.property.address}, Unit ${lease.unit.unitNumber}`;
    await resend.emails.send({
      from: FROM,
      to: landlord.email,
      subject: `Lease expiring in ${days} days — ${addr}`,
      html: `<p>Hi ${landlord.name},</p><p><strong>${tenantNames}</strong> at ${addr} has a lease expiring in <strong>${days} days</strong> (${lease.endDate.toLocaleDateString()}).</p><p><a href="${APP_URL}/dashboard/leases/${lease.id}">View Lease</a></p>`,
    });
  }

  // 4. Renters insurance expiring in 30 days
  const insuranceExpiring = await prisma.tenant.findMany({
    where: {
      isActive: true,
      insuranceExpiresAt: {
        gte: now,
        lte: addDays(now, 30),
      },
    },
    select: { name: true, insuranceExpiresAt: true, leases: { where: { lease: { status: "active" } }, include: { lease: { include: { unit: { include: { property: true } }, tenants: { where: { isPrimary: true } } } } } } },
  });

  const landlordInsurance: Record<string, typeof insuranceExpiring> = {};
  for (const t of insuranceExpiring) {
    const activeLt = t.leases[0];
    if (!activeLt) continue;
    const lid = activeLt.lease.landlordId;
    if (!landlordInsurance[lid]) landlordInsurance[lid] = [];
    landlordInsurance[lid].push(t);
  }
  for (const [landlordId, tenants] of Object.entries(landlordInsurance)) {
    const landlord = await prisma.landlord.findUnique({ where: { id: landlordId } });
    if (!landlord?.email || !landlord.notifyOnInsuranceExpiring) continue;
    const lines = tenants.map((t) => {
      const days = Math.ceil((new Date(t.insuranceExpiresAt!).getTime() - now.getTime()) / 86400000);
      const lease = t.leases[0]?.lease;
      const addr = lease ? `${lease.unit.property.address}, Unit ${lease.unit.unitNumber}` : "";
      return `<li>${t.name} (${addr}) — expires in ${days} day${days !== 1 ? "s" : ""}</li>`;
    }).join("");
    await resend.emails.send({
      from: FROM,
      to: landlord.email,
      subject: `Renters insurance expiring soon`,
      html: `<p>Hi ${landlord.name},</p><p>The following tenant(s) have renters insurance expiring within 30 days:</p><ul>${lines}</ul><p><a href="${APP_URL}/dashboard/tenants">View Tenants</a></p>`,
    });
  }

  // 5. Unacknowledged maintenance requests — 24h
  const dayAgo = addDays(now, -1);
  const unacked = await prisma.maintenanceRequest.findMany({
    where: {
      status: "open",
      acknowledgedAt: null,
      submittedAt: { lt: dayAgo },
    },
    include: { unit: { include: { property: true } }, tenant: true },
  });

  const landlordUnacked: Record<string, typeof unacked> = {};
  for (const req of unacked) {
    if (!landlordUnacked[req.landlordId]) landlordUnacked[req.landlordId] = [];
    landlordUnacked[req.landlordId].push(req);
  }

  for (const [landlordId, reqs] of Object.entries(landlordUnacked)) {
    const landlord = await prisma.landlord.findUnique({ where: { id: landlordId } });
    if (!landlord?.email) continue;
    const lines = reqs.map((r) => `<li>${r.title} — ${r.unit.property.address} Unit ${r.unit.unitNumber} (${r.priority})</li>`).join("");
    await resend.emails.send({
      from: FROM,
      to: landlord.email,
      subject: `${reqs.length} unacknowledged maintenance request(s)`,
      html: `<p>Hi ${landlord.name},</p><p>These maintenance requests haven't been acknowledged in over 24 hours:</p><ul>${lines}</ul><p><a href="${APP_URL}/dashboard/maintenance">View Requests</a></p>`,
    });
  }

  return NextResponse.json({ ok: true, processed: { upcomingPayments: upcomingPayments.length, overduePayments: overduePayments.length, expiringLeases: leases.length, unacknowledged: unacked.length } });
}
