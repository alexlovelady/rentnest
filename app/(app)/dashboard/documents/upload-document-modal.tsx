"use client";
import { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";

interface Property { id: string; nickname: string }
interface Lease { id: string; unit: { unitNumber: string; property: { address: string } }; tenants: { tenant: { name: string } }[] }

export function UploadDocumentModal({ properties, leases }: { properties: Property[]; leases: Lease[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const file = fileRef.current?.files?.[0];

    try {
      if (!file) throw new Error("Please select a file");

      setUploadProgress("Uploading file…");
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("name", fd.get("name") as string);
      uploadData.append("docType", fd.get("docType") as string);
      const propertyId = fd.get("propertyId") as string;
      const leaseId = fd.get("leaseId") as string;
      if (propertyId) uploadData.append("propertyId", propertyId);
      if (leaseId) uploadData.append("leaseId", leaseId);
      const notes = fd.get("notes") as string;
      if (notes) uploadData.append("notes", notes);

      const res = await fetch("/api/landlord/upload-document", { method: "POST", body: uploadData });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Upload failed");
      }

      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><Upload size={14} /> Upload Document</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Upload Document">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Document name" name="name" required />
          <Select label="Document type" name="docType">
            {["lease", "addendum", "inspection", "notice", "insurance", "permit", "other"].map(t => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </Select>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              required
              className="hidden"
              onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name || "")}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Upload size={14} />
              {selectedFileName ? selectedFileName : "Choose file…"}
            </button>
          </div>
          <Select label="Property (optional)" name="propertyId">
            <option value="">Not property-specific</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.nickname}</option>)}
          </Select>
          <Select label="Lease (optional)" name="leaseId">
            <option value="">Not lease-specific</option>
            {leases.map(l => (
              <option key={l.id} value={l.id}>
                {l.tenants.map(lt => lt.tenant.name).join(", ")} — {l.unit.property.address} Unit {l.unit.unitNumber}
              </option>
            ))}
          </Select>
          {uploadProgress && <p className="text-sm text-blue-600">{uploadProgress}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Uploading…" : "Upload"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
