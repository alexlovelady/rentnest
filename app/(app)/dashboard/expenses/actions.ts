"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";
import { z } from "zod";

const ExpenseSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number(),
  date: z.string(),
  vendor: z.string().optional(),
  propertyId: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export async function createExpense(data: z.infer<typeof ExpenseSchema>) {
  const user = await requireServerUser();
  const parsed = ExpenseSchema.parse(data);
  await prisma.expense.create({
    data: {
      ...parsed,
      date: new Date(parsed.date),
      propertyId: parsed.propertyId || null,
      landlordId: user.id,
    },
  });
  revalidatePath("/dashboard/expenses");
}

export async function deleteExpense(id: string) {
  const user = await requireServerUser();
  await prisma.expense.deleteMany({ where: { id, landlordId: user.id } });
  revalidatePath("/dashboard/expenses");
}
