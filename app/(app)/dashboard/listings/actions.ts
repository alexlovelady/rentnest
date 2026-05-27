"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";
import { PLAN_LIMITS } from "@/lib/stripe";

export async function createListing(data: {
  unitId: string;
  quizId?: string;
  title: string;
  description?: string;
  askingRent: number;
  availableAt?: string;
}) {
  const user = await requireServerUser();

  const limit = PLAN_LIMITS[user.plan] ?? 0;
  if (limit === 0) throw new Error("Upgrade your plan to create listings.");

  // Verify unit belongs to this landlord
  const unit = await prisma.unit.findFirst({
    where: { id: data.unitId, property: { landlordId: user.id } },
  });
  if (!unit) throw new Error("Unit not found.");

  // Deactivate any existing active listing for this unit
  await prisma.listing.updateMany({
    where: { unitId: data.unitId, status: "active" },
    data: { status: "inactive" },
  });

  const listing = await prisma.listing.create({
    data: {
      landlordId: user.id,
      unitId: data.unitId,
      quizId: data.quizId || null,
      title: data.title,
      description: data.description || null,
      askingRent: data.askingRent,
      availableAt: data.availableAt ? new Date(data.availableAt) : null,
    },
  });

  revalidatePath("/dashboard/listings");
  return listing;
}

export async function updateListingStatus(listingId: string, status: "active" | "inactive" | "rented") {
  const user = await requireServerUser();
  await prisma.listing.updateMany({
    where: { id: listingId, landlordId: user.id },
    data: { status },
  });
  revalidatePath("/dashboard/listings");
}

export async function deleteListing(listingId: string) {
  const user = await requireServerUser();
  await prisma.listing.deleteMany({ where: { id: listingId, landlordId: user.id } });
  revalidatePath("/dashboard/listings");
}
