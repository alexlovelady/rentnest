"use client";
import { useState, useRef } from "react";
import { Paperclip, Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addMaintenanceComment } from "../actions";
import { getFirebaseStorage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Comment {
  id: string;
  body: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: Date;
}

interface Props {
  requestId: string;
  initialComments: Comment[];
}

export function CommentsPanel({ requestId, initialComments }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() && !file) return;
    setLoading(true);
    setError("");

    try {
      let attachmentUrl: string | undefined;
      let attachmentName: string | undefined;

      if (file) {
        const storage = getFirebaseStorage();
        const storageRef = ref(storage, `maintenance/${requestId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        attachmentUrl = await getDownloadURL(storageRef);
        attachmentName = file.name;
      }

      const newComment = await addMaintenanceComment(requestId, body.trim() || "(attachment)", attachmentUrl, attachmentName);
      setComments((prev) => [...prev, { ...newComment, createdAt: new Date(newComment.createdAt) }]);
      setBody("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">Updates &amp; Notes</h2>

      {comments.length === 0 && (
        <p className="text-sm text-gray-400">No updates yet. Add the first one below.</p>
      )}

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="text-gray-800">{c.body}</p>
            {c.attachmentUrl && (
              <a
                href={c.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-xs text-primary hover:underline"
              >
                <FileText size={12} />
                {c.attachmentName || "Attachment"}
              </a>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t border-gray-100">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Textarea
          placeholder="Add an update, note, or invoice details..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
        />
        {file && (
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded px-3 py-1.5">
            <FileText size={12} />
            <span className="flex-1 truncate">{file.name}</span>
            <button type="button" className="text-gray-400 hover:text-red-500" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>
              ✕
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <Paperclip size={14} />
            Attach file
          </button>
          <Button type="submit" size="sm" disabled={loading || (!body.trim() && !file)}>
            <Send size={13} />
            {loading ? "Saving..." : "Add Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}
