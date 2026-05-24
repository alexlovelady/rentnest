"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";
import { generateMonthlyRent } from "@/lib/rent";
import { currentPeriod } from "@/lib/utils";
import { z } from "zod";

export async function generateRent(month?: number, year?: number) {
  const user = await requireServerUser();
  const { month: m, year: y } = currentPeriod();
  await generateMonthlyRent(user.id, month ?? m, year ?? y);
  revalidatePath("/dashboard/rent");
}

export async function recordPayment(data: {
  leaseId: string;
  amount: number;
  periodMonth: number;
  periodYear: number;
  paymentMethod: string;
  paidAt: string;
  notes?: string;
  sendReceipt?: boolean;
}) {
  const user = await requireServerUser();

  const lease = await prisma.lease.findFirst({ where: { id: data.leaseId, landlordId: user.id }, include: { tenants: { include: { tenant: true } } } });
  if (!lease) throw new Error("Lease not found");

  const existing = await prisma.rentPayment.findFirst({
    where: { leaseId: data.leaseId, periodMonth: data.periodMonth, periodYear: data.periodYear },
  });

  const primaryTenant = lease.tenants.find((lt) => lt.isPrimary)?.tenant || lease.tenants[0]?.tenant;
  const dueDate = new Date(data.periodYear, data.periodMonth - 1, lease.rentDueDay);

  let payment;
  if (existing) {
    payment = await prisma.rentPayment.update({
      where: { id: existing.id },
      data: {
        status: "paid",
        paidAt: new Date(data.paidAt),
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        amount: data.amount,
        totalAmount: data.amount,
      },
    });
  } else {
    payment = await prisma.rentPayment.create({
      data: {
        leaseId: data.leaseId,
        tenantId: primaryTenant?.id,
        landlordId: user.id,
        amount: data.amount,
        lateFee: 0,
        totalAmount: data.amount,
        paymentMethod: data.paymentMethod,
        status: "paid",
        periodMonth: data.periodMonth,
        periodYear: data.periodYear,
        paidAt: new Date(data.paidAt),
        dueDate,
        notes: data.notes,
      },
    });
  }

  if (data.sendReceipt && primaryTenant?.email) {
    const { resend, FROM } = await import("@/lib/resend");
    await resend.emails.send({
      from: FROM,
      to: primaryTenant.email,
      subject: `Rent receipt — ${new Date(data.periodYear, data.periodMonth - 1).toLocaleString("en-US", { month: "long", year: "numeric" })}`,
      html: `<p>Hi ${primaryTenant.name},</p><p>This is a receipt confirming your rent payment of <strong>$${data.amount.toFixed(2)}</strong> for ${new Date(data.periodYear, data.periodMonth - 1).toLocaleString("en-US", { month: "long", year: "numeric" })}.</p><p>Payment method: ${data.paymentMethod}</p>`,
    });
  }

  revalidatePath("/dashboard/rent");
  return payment;
}

export async function sendRentReminders() {
  const user = await requireServerUser();
  const { month, year } = currentPeriod();

  const payments = await prisma.rentPayment.findMany({
    where: { landlordId: user.id, periodMonth: month, periodYear: year, status: "pending" },
    include: {
      tenant: true,
      lease: { include: { unit: { include: { property: true } } } },
    },
  });

  const { resend, FROM, APP_URL } = await import("@/lib/resend");
  for (const payment of payments) {
    if (!payment.tenant?.email) continue;
    const addr = `${payment.lease.unit.property.address}, Unit ${payment.lease.unit.unitNumber}`;
    await resend.emails.send({
      from: FROM,
      to: payment.tenant.email,
      subject: `Rent reminder — $${payment.totalAmount.toFixed(2)} due`,
      html: `<p>Hi ${payment.tenant.name},</p><p>Your rent of <strong>$${payment.totalAmount.toFixed(2)}</strong> for ${addr} is due on ${payment.dueDate.toLocaleDateString()}.</p><p>Contact your landlord or <a href="${APP_URL}/tenant-portal">pay online</a>.</p>`,
    });
  }

  revalidatePath("/dashboard/rent");
  return { sent: payments.filter((p) => p.tenant?.email).length };
}
