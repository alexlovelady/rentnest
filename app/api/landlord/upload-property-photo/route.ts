import { NextRequest, NextResponse } from "next/server";
import { requireServerUser } from "@/lib/auth";
import { admin } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await requireServerUser();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const propertyId = formData.get("propertyId") as string | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!propertyId) return NextResponse.json({ error: "No propertyId provided" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });

  // Verify the property belongs to this landlord
  const property = await prisma.property.findFirst({ where: { id: propertyId, landlordId: user.id } });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `properties/${user.id}/${propertyId}/${Date.now()}.${ext}`;

  const bucket = admin().storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  const fileRef = bucket.file(filename);
  await fileRef.save(buffer, { contentType: file.type });
  await fileRef.makePublic();

  const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;

  await prisma.property.update({ where: { id: propertyId }, data: { photoUrl: url } });

  return NextResponse.json({ url });
}
