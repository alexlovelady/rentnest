import { cookies } from "next/headers";
import { admin } from "./firebase-admin";
import { prisma } from "./prisma";
import type { Landlord } from "@prisma/client";

export async function getServerUser(): Promise<Landlord | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  try {
    const decoded = await admin().auth().verifySessionCookie(session, true);
    const landlord = await prisma.landlord.findUnique({
      where: { firebaseUid: decoded.uid },
    });
    return landlord;
  } catch {
    return null;
  }
}

export async function requireServerUser(): Promise<Landlord> {
  const user = await getServerUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
    throw new Error("Redirecting");
  }
  return user;
}
