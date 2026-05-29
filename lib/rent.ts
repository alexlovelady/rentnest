"use server";
import { prisma } from "./prisma";
import { addDays } from "date-fns";

// Auto-generate upcoming rent charges within a lookahead window (default 7 days).
// Covers current and next month so landlords always see charges before the due date.
export async function autoGenerateUpcomingRent(landlordId: string, lookaheadDays = 7) {
  const now = new Date();
  const horizon = addDays(now, lookaheadDays);

  const leases = await prisma.lease.findMany({
    where: { landlordId, status: "active" },
    include: { tenants: true },
  });

  const results = [];
  for (const lease of leases) {
    // Check current month and the month after to cover month-boundary edge cases
    for (let offset = 0; offset <= 1; offset++) {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, lease.rentDueDay);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();

      // Only generate if the due date falls within our horizon and on/after rent start
      if (d > horizon) continue;
      const chargeStart = lease.rentStartDate ?? lease.startDate;
      if (d < chargeStart) continue;

      const existing = await prisma.rentPayment.findFirst({
        where: { leaseId: lease.id, periodMonth: month, periodYear: year },
      });
      if (existing) continue;

      const primaryTenant = lease.tenants.find((t) => t.isPrimary) || lease.tenants[0];
      const payment = await prisma.rentPayment.create({
        data: {
          leaseId: lease.id,
          tenantId: primaryTenant?.tenantId || null,
          landlordId,
          amount: lease.monthlyRent,
          lateFee: 0,
          totalAmount: lease.monthlyRent,
          status: "pending",
          paymentMethod: "online",
          periodMonth: month,
          periodYear: year,
          dueDate: d,
        },
      });
      results.push(payment);
    }
  }
  return results;
}

export async function generateMonthlyRent(landlordId: string, month: number, year: number) {
  const leases = await prisma.lease.findMany({
    where: { landlordId, status: "active" },
    include: { tenants: true },
  });

  const results = [];
  for (const lease of leases) {
    const existing = await prisma.rentPayment.findFirst({
      where: { leaseId: lease.id, periodMonth: month, periodYear: year },
    });
    if (existing) continue;

    const dueDate = new Date(year, month - 1, lease.rentDueDay);
    const primaryTenant = lease.tenants.find((t) => t.isPrimary) || lease.tenants[0];

    const payment = await prisma.rentPayment.create({
      data: {
        leaseId: lease.id,
        tenantId: primaryTenant?.tenantId || null,
        landlordId,
        amount: lease.monthlyRent,
        lateFee: 0,
        totalAmount: lease.monthlyRent,
        status: "pending",
        paymentMethod: "online",
        periodMonth: month,
        periodYear: year,
        dueDate,
      },
    });
    results.push(payment);
  }
  return results;
}

export async function applyLateFees(landlordId: string) {
  const now = new Date();
  const payments = await prisma.rentPayment.findMany({
    where: { landlordId, status: "pending", lateFeeApplied: false },
    include: { lease: true },
  });

  for (const payment of payments) {
    const grace = payment.lease.lateFeeGracePeriodDays;
    const deadline = new Date(payment.dueDate);
    deadline.setDate(deadline.getDate() + grace);

    if (now > deadline && payment.lease.lateFeeEnabled) {
      let fee = 0;
      if (payment.lease.lateFeeType === "flat") {
        fee = payment.lease.lateFeeAmount;
      } else {
        fee = (payment.amount * payment.lease.lateFeeAmount) / 100;
      }

      await prisma.rentPayment.update({
        where: { id: payment.id },
        data: {
          lateFee: fee,
          totalAmount: payment.amount + fee,
          lateFeeApplied: true,
        },
      });
    }
  }
}
