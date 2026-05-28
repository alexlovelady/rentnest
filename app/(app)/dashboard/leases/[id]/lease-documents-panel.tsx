"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDocument } from "../../documents/actions";

interface Doc {
  id: string;
  name: string;
  docType: string;
  fileUrl: string;
  fileType: string | null;
  uploadedAt: Date;
}

export function LeaseDocumentsPanel({ leaseId, documents }: { leaseId: string; documents: Doc[] }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name.replace(/\.[^.]+$/, ""));
      formData.append("docType", "lease");
      formData.append("leaseId", leaseId);
      const res = await fetch("/api/landlord/upload-document", { method: "POST", body: formData });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Upload failed");
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    await deleteDocument(id);
    router.refresh();
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" className="hidden" onChange={handleFile} />
      {documents.length === 0 ? (
        <p className="text-sm text-gray-500 mb-3">No documents attached to this lease.</p>
      ) : (
        <div className="space-y-2 mb-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-gray-400 shrink-0" />
                <span className="font-medium text-gray-800">{doc.name}</span>
                {doc.fileType && <span className="text-xs text-gray-400 uppercase">{doc.fileType}</span>}
              </div>
              <div className="flex items-center gap-2">
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                  <ExternalLink size={12} /> Open
                </a>
                <button onClick={() => handleDelete(doc.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
        <Upload size={14} /> {uploading ? "Uploading…" : "Attach Document"}
      </Button>
    </div>
  );
}
