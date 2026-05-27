import { NextRequest, NextResponse } from "next/server";
import { getTenantUser } from "@/lib/tenant-auth";
import { admin } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const session = await getTenantUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `maintenance-photos/${session.landlordId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const bucket = admin().storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  const fileRef = bucket.file(filename);
  await fileRef.save(buffer, { contentType: file.type });
  await fileRef.makePublic();

  const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  return NextResponse.json({ url });
}
