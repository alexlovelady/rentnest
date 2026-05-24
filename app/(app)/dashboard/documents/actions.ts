"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";
import { z } from "zod";

const DocumentSchema = z.object({
  name: z.string().min(1),
  docType: z.string().default("other"),
  fileUrl: z.string().url(),
  fileType: z.string().optional(),
  propertyId: z.string().optional().nullable(),
  leaseId: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export async function createDocument(data: z.infer<typeof DocumentSchema>) {
  const user = await requireServerUser();
  const parsed = DocumentSchema.parse(data);
  await prisma.document.create({
    data: {
      ...parsed,
      propertyId: parsed.propertyId || null,
      leaseId: parsed.leaseId || null,
      landlordId: user.id,
    },
  });
  revalidatePath("/dashboard/documents");
}

export async function deleteDocument(id: string) {
  const user = await requireServerUser();
  await prisma.document.deleteMany({ where: { id, landlordId: user.id } });
  revalidatePath("/dashboard/documents");
}
