import { NextRequest, NextResponse } from "next/server";
import { requireServerUser } from "@/lib/auth";
import { admin } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await requireServerUser();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const name = formData.get("name") as string | null;
  const docType = (formData.get("docType") as string) || "other";
  const propertyId = (formData.get("propertyId") as string) || null;
  const leaseId = (formData.get("leaseId") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });

  // Verify property/lease ownership if provided
  if (propertyId) {
    const prop = await prisma.property.findFirst({ where: { id: propertyId, landlordId: user.id } });
    if (!prop) return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }
  if (leaseId) {
    const lease = await prisma.lease.findFirst({ where: { id: leaseId, landlordId: user.id } });
    if (!lease) return NextResponse.json({ error: "Lease not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const filename = `documents/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const bucket = admin().storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  const fileRef = bucket.file(filename);
  await fileRef.save(buffer, { contentType: file.type });
  await fileRef.makePublic();

  const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  const fileType = ext;

  await prisma.document.create({
    data: {
      name,
      docType,
      fileUrl: url,
      fileType,
      propertyId: propertyId || null,
      leaseId: leaseId || null,
      notes: notes || null,
      landlordId: user.id,
    },
  });

  return NextResponse.json({ url });
}
