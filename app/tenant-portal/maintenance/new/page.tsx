"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, X } from "lucide-react";

export default function NewTenantMaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - photos.length;
    const toAdd = files.slice(0, remaining);
    setPhotos((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(previews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    try {
      // Upload photos first
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const uploadFd = new FormData();
        uploadFd.append("file", photo);
        const uploadRes = await fetch("/api/tenant/upload", { method: "POST", body: uploadFd });
        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          throw new Error(data.error || "Photo upload failed");
        }
        const { url } = await uploadRes.json();
        photoUrls.push(url);
      }

      const res = await fetch("/api/tenant/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fd.get("title"),
          description: fd.get("description"),
          category: fd.get("category"),
          priority: fd.get("priority"),
          photoUrls,
        }),
      });

      if (res.ok) {
        router.push("/tenant-portal/maintenance");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit request");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-dark">New Maintenance Request</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="What's the issue?" name="title" placeholder="e.g. Kitchen faucet leaking" required />
          <Textarea label="Please describe the issue" name="description" required rows={4} placeholder="When did it start? How severe is it?" />
          <Select label="Category" name="category">
            {["plumbing", "electrical", "hvac", "appliance", "structural", "pest", "cleaning", "other"].map(c => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </Select>
          <Select label="How urgent is this?" name="priority">
            <option value="low">Low — not urgent</option>
            <option value="normal">Normal</option>
            <option value="high">High — needs attention soon</option>
            <option value="emergency">Emergency — immediate danger</option>
          </Select>

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos (optional, up to 3)</label>
            {previews.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt={`Photo ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-gray-100" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full p-0.5 shadow-sm hover:bg-red-50 transition"
                    >
                      <X size={12} className="text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length < 3 && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  <Camera size={14} />
                  {photos.length === 0 ? "Add photos" : "Add more"}
                </button>
              </>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (photos.length > 0 ? "Uploading photos…" : "Submitting…") : "Submit Request"}
          </Button>
        </form>
      </div>
    </div>
  );
}
