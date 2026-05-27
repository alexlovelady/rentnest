"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";
import { z } from "zod";

const AccountSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  timezone: z.string().optional(),
});

const NotificationSchema = z.object({
  notifyOnPayment: z.coerce.boolean(),
  notifyOnMaintenance: z.coerce.boolean(),
  notifyOnOverdue: z.coerce.boolean(),
});

const LateFeeSchema = z.object({
  feePassthrough: z.coerce.boolean(),
  defaultLateFeeEnabled: z.coerce.boolean(),
  defaultLateFeeType: z.enum(["flat", "percent"]),
  defaultLateFeeAmount: z.coerce.number().min(0),
  defaultLateFeeGraceDays: z.coerce.number().min(0).max(30),
});

export async function updateAccount(data: z.infer<typeof AccountSchema>) {
  const user = await requireServerUser();
  const parsed = AccountSchema.parse(data);
  await prisma.landlord.update({ where: { id: user.id }, data: parsed });
  revalidatePath("/dashboard/settings");
}

export async function updateNotifications(data: z.infer<typeof NotificationSchema>) {
  const user = await requireServerUser();
  const parsed = NotificationSchema.parse(data);
  await prisma.landlord.update({ where: { id: user.id }, data: parsed });
  revalidatePath("/dashboard/settings");
}

export async function updateLateFeeDefaults(data: z.infer<typeof LateFeeSchema>) {
  const user = await requireServerUser();
  const parsed = LateFeeSchema.parse(data);
  await prisma.landlord.update({ where: { id: user.id }, data: parsed });
  revalidatePath("/dashboard/settings");
}

export async function updateContactVisibility(data: { showEmailToTenants: boolean; showPhoneToTenants: boolean }) {
  const user = await requireServerUser();
  await prisma.landlord.update({ where: { id: user.id }, data });
  revalidatePath("/dashboard/settings");
}

export async function markConnectReady() {
  const user = await requireServerUser();
  const { stripe } = await import("@/lib/stripe");
  if (!user.stripeConnectId) return;

  const account = await stripe.accounts.retrieve(user.stripeConnectId);
  const ready = account.charges_enabled && account.payouts_enabled;
  await prisma.landlord.update({ where: { id: user.id }, data: { stripeConnectReady: ready } });
  revalidatePath("/dashboard/settings");
  return { ready };
}
