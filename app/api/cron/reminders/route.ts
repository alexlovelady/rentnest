import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, FROM, APP_URL } from "@/lib/resend";
import { applyLateFees, generateMonthlyRent } from "@/lib/rent";
import { signTenantToken } from "@/lib/tenant-auth";
import { addDays, isAfter, differenceInDays } from "date-fns";
import { emailBase, greeting, ep, detailTable, emailList, alertBox, btn } from "@/lib/email";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 0a. Auto-generate monthly charges for all active landlords (idempotent — skips existing records)
  const activeLandlords = await prisma.landlord.findMany({ where: { plan: { not: "cancelled" } }, select: { id: true } });
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  for (const l of activeLandlords) {
    await generateMonthlyRent(l.id, currentMonth, currentYear);
  }

  // 0b. Apply late fees for all landlords with overdue payments
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
      html: emailBase(
        greeting(payment.tenant.name) +
        ep(`Your rent for <strong>${addr}</strong> is due soon.`) +
        detailTable([
          ["Amount due", `$${payment.totalAmount.toFixed(2)}`],
          ["Due date", payment.dueDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
          ["Property", addr],
        ]) +
        btn("Pay Online →", portalUrl)
      ),
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
        html: emailBase(
          alertBox("Your rent is past due. Please pay as soon as possible to avoid additional late fees.", "error") +
          greeting(payment.tenant.name) +
          ep(`Your rent for <strong>${addr}</strong> is overdue.`) +
          detailTable([
            ["Amount overdue", `$${payment.totalAmount.toFixed(2)}`],
            ["Original due date", payment.dueDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
            ["Property", addr],
          ]) +
          btn("Pay Online →", portalUrl)
        ),
      });
    }
  }

  for (const [landlordId, payments] of Object.entries(landlordOverdue)) {
    const landlord = await prisma.landlord.findUnique({ where: { id: landlordId } });
    if (!landlord?.notifyOnOverdue || !landlord.email) continue;
    await resend.emails.send({
      from: FROM,
      to: landlord.email,
      subject: `${payments.length} overdue rent payment${payments.length > 1 ? "s" : ""} need attention`,
      html: emailBase(
        greeting(landlord.name) +
        ep(`${payments.length} tenant${payments.length > 1 ? "s have" : " has"} overdue rent that needs your attention.`) +
        emailList(payments.map((p) => `<strong>${p.tenant?.name}</strong> — ${p.lease.unit.property.address} Unit ${p.lease.unit.unitNumber} — <strong>$${p.totalAmount.toFixed(2)}</strong>`)) +
        btn("View Rent Dashboard →", `${APP_URL}/dashboard/rent`)
      ),
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
      html: emailBase(
        greeting(landlord.name) +
        ep(`A lease is expiring in <strong>${days} days</strong> and may need to be renewed.`) +
        detailTable([
          ["Tenant(s)", tenantNames],
          ["Property", addr],
          ["Expiration date", lease.endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
          ["Days remaining", `${days} days`],
        ]) +
        btn("View Lease →", `${APP_URL}/dashboard/leases/${lease.id}`)
      ),
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
    const insuranceItems = tenants.map((t) => {
      const daysLeft = Math.ceil((new Date(t.insuranceExpiresAt!).getTime() - now.getTime()) / 86400000);
      const tLease = t.leases[0]?.lease;
      const tAddr = tLease ? `${tLease.unit.property.address}, Unit ${tLease.unit.unitNumber}` : "";
      return `<strong>${t.name}</strong>${tAddr ? ` (${tAddr})` : ""} — expires in <strong>${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong>`;
    });
    await resend.emails.send({
      from: FROM,
      to: landlord.email,
      subject: `Renters insurance expiring soon`,
      html: emailBase(
        greeting(landlord.name) +
        ep(`${tenants.length} tenant${tenants.length > 1 ? "s have" : " has"} renters insurance expiring within 30 days.`) +
        emailList(insuranceItems) +
        btn("View Tenants →", `${APP_URL}/dashboard/tenants`)
      ),
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
    await resend.emails.send({
      from: FROM,
      to: landlord.email,
      subject: `${reqs.length} unacknowledged maintenance request${reqs.length > 1 ? "s" : ""}`,
      html: emailBase(
        greeting(landlord.name) +
        alertBox(`${reqs.length} maintenance request${reqs.length > 1 ? "s have" : " has"} not been acknowledged in over 24 hours.`, "warning") +
        emailList(reqs.map((r) => `<strong>${r.title}</strong> — ${r.unit.property.address} Unit ${r.unit.unitNumber} <span style="color:#9ca3af;">(${r.priority})</span>`)) +
        btn("View Maintenance Requests →", `${APP_URL}/dashboard/maintenance`)
      ),
    });
  }

  return NextResponse.json({ ok: true, processed: { upcomingPayments: upcomingPayments.length, overduePayments: overduePayments.length, expiringLeases: leases.length, unacknowledged: unacked.length } });
}
