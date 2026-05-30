"use server";
import { requireServerUser } from "@/lib/auth";
import { airtableCreate, today } from "@/lib/airtable";

export async function submitSupport(type: string, message: string) {
  const user = await requireServerUser();
  if (!type || !message.trim()) throw new Error("Type and message are required");

  await airtableCreate("Customer Feedback", {
    Product: "RentNest",
    Type: type,
    Message: `[${user.name} — ${user.email}]\n\n${message.trim()}`,
    Source: "Support Form",
    Date: today(),
  });
}
