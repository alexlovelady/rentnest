import { NextRequest, NextResponse } from "next/server";
import { admin } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { idToken, name } = await req.json();

  try {
    const decoded = await admin().auth().verifyIdToken(idToken);

    let landlord = await prisma.landlord.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!landlord) {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);
      landlord = await prisma.landlord.create({
        data: {
          firebaseUid: decoded.uid,
          email: decoded.email!,
          name: name || decoded.name || decoded.email!.split("@")[0],
          plan: "trial",
          trialEndsAt,
        },
      });
    }

    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await admin().auth().createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Session error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return NextResponse.json({ ok: true });
}
