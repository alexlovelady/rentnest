"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAddendum, deleteAddendum, requestAddendumSignature } from "../actions";
import { Trash2, Send, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddendumSignature {
  id: string;
  tenantId: string;
  status: string;
  signedAt: Date | null;
  tenant: { name: string };
}

interface Addendum {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  signatures: AddendumSignature[];
}

interface Props {
  leaseId: string;
  addendums: Addendum[];
  hasTenants: boolean;
}

export function AddendumsPanel({ leaseId, addendums, hasTenants }: Props) {
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "" });
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading("create");
    await createAddendum(leaseId, form);
    setForm({ title: "", body: "" });
    setAdding(false);
    setLoading(null);
    router.refresh();
  }

  async function handleDelete(addendumId: string) {
    setLoading(addendumId + "_del");
    await deleteAddendum(addendumId, leaseId);
    setLoading(null);
    router.refresh();
  }

  async function handleRequestSignature(addendumId: string) {
    setLoading(addendumId + "_sig");
    await requestAddendumSignature(addendumId, leaseId);
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {addendums.length === 0 && !adding && (
        <p className="text-sm text-gray-400">No addendums yet.</p>
      )}

      {addendums.map((a) => (
        <div key={a.id} className="border border-gray-100 rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900">{a.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasTenants && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleRequestSignature(a.id)}
                  disabled={loading === a.id + "_sig"}
                >
                  <Send size={12} className="mr-1" />
                  {loading === a.id + "_sig" ? "Sending…" : "Request Signatures"}
                </Button>
              )}
              <button
                onClick={() => handleDelete(a.id)}
                disabled={loading === a.id + "_del"}
                className="text-gray-300 hover:text-red-400 transition"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 whitespace-pre-wrap border-l-2 border-gray-100 pl-3">{a.body}</p>

          {a.signatures.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-gray-50">
              <p className="text-xs font-medium text-gray-500">Signatures</p>
              {a.signatures.map((sig) => (
                <div key={sig.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{sig.tenant.name}</span>
                  {sig.status === "signed" ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                      <Check size={11} /> Signed {sig.signedAt ? new Date(sig.signedAt).toLocaleDateString() : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-yellow-600 font-medium">Awaiting signature</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleCreate} className="border border-gray-100 rounded-lg p-4 space-y-3 bg-gray-50">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Pet Addendum"
            required
          />
          <div>
            <label className="text-xs text-gray-500 block mb-1">Body / Terms</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={5}
              placeholder="Enter the addendum terms…"
              required
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C4622D]/30 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading === "create"}>
              {loading === "create" ? "Saving…" : "Create Addendum"}
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>+ Add Addendum</Button>
      )}
    </div>
  );
}
