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
  lateFee?: number;
  daysLate?: number;
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

  const lateFee = data.lateFee ?? 0;
  const totalAmount = data.amount + lateFee;

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
        lateFee,
        lateFeeApplied: lateFee > 0,
        totalAmount,
      },
    });
  } else {
    payment = await prisma.rentPayment.create({
      data: {
        leaseId: data.leaseId,
        tenantId: primaryTenant?.id,
        landlordId: user.id,
        amount: data.amount,
        lateFee,
        lateFeeApplied: lateFee > 0,
        totalAmount,
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
    const { emailBase, greeting, ep, detailTable, alertBox } = await import("@/lib/email");
    const periodStr = new Date(data.periodYear, data.periodMonth - 1).toLocaleString("en-US", { month: "long", year: "numeric" });
    await resend.emails.send({
      from: FROM,
      to: primaryTenant.email,
      subject: `Rent receipt — ${periodStr}`,
      html: emailBase(
        alertBox("Your rent payment has been recorded.", "success") +
        greeting(primaryTenant.name) +
        ep(`This is a receipt confirming your rent payment for <strong>${periodStr}</strong>.`) +
        detailTable([
          ["Amount paid", `$${data.amount.toFixed(2)}`],
          ["Period", periodStr],
          ["Payment method", data.paymentMethod],
          ["Date", new Date(data.paidAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
        ])
      ),
    });
  }

  revalidatePath("/dashboard/rent");
  return payment;
}

export async function waiveLateFee(paymentId: string) {
  const user = await requireServerUser();
  const payment = await prisma.rentPayment.findFirst({
    where: { id: paymentId, landlordId: user.id, status: "pending" },
  });
  if (!payment) throw new Error("Payment not found");
  await prisma.rentPayment.update({
    where: { id: paymentId },
    data: {
      lateFee: 0,
      totalAmount: payment.amount,
      lateFeeApplied: true, // keep true so cron doesn't re-apply it
    },
  });
  revalidatePath("/dashboard/rent");
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
    const { emailBase: eb, greeting: gr, ep: paragraph, detailTable: dt, btn: button } = await import("@/lib/email");
    await resend.emails.send({
      from: FROM,
      to: payment.tenant.email,
      subject: `Rent reminder — $${payment.totalAmount.toFixed(2)} due`,
      html: eb(
        gr(payment.tenant.name) +
        paragraph(`Your rent for <strong>${addr}</strong> is due soon.`) +
        dt([
          ["Amount due", `$${payment.totalAmount.toFixed(2)}`],
          ["Due date", payment.dueDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
          ["Property", addr],
        ]) +
        button("Pay Online →", `${APP_URL}/tenant-portal`)
      ),
    });
  }

  revalidatePath("/dashboard/rent");
  return { sent: payments.filter((p) => p.tenant?.email).length };
}
