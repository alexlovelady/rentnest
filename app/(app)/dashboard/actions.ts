"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";

export async function dismissOnboarding() {
  const user = await requireServerUser();
  await prisma.landlord.update({ where: { id: user.id }, data: { onboardingDismissed: true } });
  revalidatePath("/dashboard");
}
