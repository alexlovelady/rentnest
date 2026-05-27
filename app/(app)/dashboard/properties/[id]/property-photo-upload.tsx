"use client";
import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { getFirebaseStorage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updatePropertyPhoto } from "./actions";
import { useRouter } from "next/navigation";

interface Props {
  propertyId: string;
  currentPhotoUrl?: string | null;
}

export function PropertyPhotoUpload({ propertyId, currentPhotoUrl }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const storageRef = ref(getFirebaseStorage(), `properties/${propertyId}/${Date.now()}.${ext}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updatePropertyPhoto(propertyId, url);
      router.refresh();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {currentPhotoUrl ? (
        <div className="relative group w-full h-52 overflow-hidden rounded-t-xl">
          <img src={currentPhotoUrl} alt="Property" className="w-full h-full object-cover" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-medium"
          >
            <Camera size={16} />
            {loading ? "Uploading…" : "Change photo"}
          </button>
        </div>
      ) : (
        <div className="px-6 pt-6 pb-0">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center gap-2 text-gray-400 hover:border-primary/50 hover:text-primary transition-colors text-sm"
          >
            <Camera size={16} />
            {loading ? "Uploading…" : "Add property photo"}
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-600 px-6 mt-1">{error}</p>}
    </div>
  );
}
