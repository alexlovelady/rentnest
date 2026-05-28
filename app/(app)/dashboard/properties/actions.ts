"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";
import { PLAN_LIMITS } from "@/lib/stripe";
import { z } from "zod";

const PropertySchema = z.object({
  nickname: z.string().min(1),
  address: z.string().min(1),
  address2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  propertyType: z.string().default("single_family"),
  squareFeet: z.coerce.number().optional().nullable(),
  unitBedrooms: z.coerce.number().min(0).optional(),
  unitBathrooms: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

const UnitSchema = z.object({
  unitNumber: z.string().min(1),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  squareFeet: z.coerce.number().optional().nullable(),
  notes: z.string().optional(),
});

export async function createProperty(data: z.infer<typeof PropertySchema>) {
  const user = await requireServerUser();
  const { unitBedrooms, unitBathrooms, ...parsed } = PropertySchema.parse(data);

  const unitCount = await prisma.unit.count({
    where: { property: { landlordId: user.id }, isActive: true },
  });
  const limit = PLAN_LIMITS[user.plan] ?? 0;
  if (unitCount >= limit) {
    throw new Error(`Your ${user.plan} plan allows up to ${limit} units. Please upgrade to add more.`);
  }

  const property = await prisma.property.create({
    data: { ...parsed, landlordId: user.id },
  });

  // Auto-create one unit for single-family homes
  await prisma.unit.create({
    data: {
      propertyId: property.id,
      unitNumber: "1",
      bedrooms: unitBedrooms ?? 1,
      bathrooms: unitBathrooms ?? 1,
    },
  });

  revalidatePath("/dashboard/properties");
  return property;
}

export async function updateProperty(id: string, data: z.infer<typeof PropertySchema>) {
  const user = await requireServerUser();
  const { unitBedrooms, unitBathrooms, ...rest } = PropertySchema.parse(data);
  const property = await prisma.property.updateMany({
    where: { id, landlordId: user.id },
    data: rest,
  });
  revalidatePath(`/dashboard/properties/${id}`);
  return property;
}

export async function deleteProperty(id: string) {
  const user = await requireServerUser();
  await prisma.property.updateMany({
    where: { id, landlordId: user.id },
    data: { isActive: false },
  });
  revalidatePath("/dashboard/properties");
}

export async function createUnit(propertyId: string, data: z.infer<typeof UnitSchema>) {
  const user = await requireServerUser();
  const parsed = UnitSchema.parse(data);

  const property = await prisma.property.findFirst({ where: { id: propertyId, landlordId: user.id } });
  if (!property) throw new Error("Not found");

  const unitCount = await prisma.unit.count({
    where: { property: { landlordId: user.id }, isActive: true },
  });
  const limit = PLAN_LIMITS[user.plan] ?? 0;
  if (unitCount >= limit) {
    throw new Error(`Your ${user.plan} plan allows up to ${limit} units. Please upgrade to add more.`);
  }

  const unit = await prisma.unit.create({ data: { ...parsed, propertyId } });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return unit;
}

export async function updateUnit(unitId: string, data: z.infer<typeof UnitSchema>) {
  const user = await requireServerUser();
  const parsed = UnitSchema.parse(data);
  await prisma.unit.updateMany({
    where: { id: unitId, property: { landlordId: user.id } },
    data: parsed,
  });
  revalidatePath("/dashboard/properties");
}

export async function updateUtilities(unitId: string, propertyId: string, data: { utilitiesIncluded: string[]; utilitiesNote: string }) {
  const user = await requireServerUser();
  await prisma.unit.updateMany({
    where: { id: unitId, property: { landlordId: user.id } },
    data: {
      utilitiesIncluded: data.utilitiesIncluded,
      utilitiesNote: data.utilitiesNote || null,
    },
  });
  revalidatePath(`/dashboard/properties/${propertyId}/units/${unitId}`);
}
