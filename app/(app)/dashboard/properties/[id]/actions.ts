"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";

export async function updatePropertyPhoto(propertyId: string, photoUrl: string) {
  const user = await requireServerUser();
  await prisma.property.updateMany({
    where: { id: propertyId, landlordId: user.id },
    data: { photoUrl },
  });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  revalidatePath("/dashboard/properties");
}
