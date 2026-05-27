"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { addEvictionRecord, deleteEvictionRecord } from "../actions";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const EVENT_TYPES = [
  { value: "notice", label: "Notice to Quit / Pay or Quit" },
  { value: "filing", label: "Court Filing" },
  { value: "hearing", label: "Court Hearing" },
  { value: "judgment", label: "Judgment Issued" },
  { value: "writ", label: "Writ of Possession" },
  { value: "lockout", label: "Lockout Executed" },
  { value: "other", label: "Other" },
];

const TYPE_COLOR: Record<string, string> = {
  notice: "bg-yellow-50 text-yellow-700 border-yellow-200",
  filing: "bg-blue-50 text-blue-700 border-blue-200",
  hearing: "bg-purple-50 text-purple-700 border-purple-200",
  judgment: "bg-orange-50 text-orange-700 border-orange-200",
  writ: "bg-red-50 text-red-700 border-red-200",
  lockout: "bg-red-100 text-red-800 border-red-300",
  other: "bg-gray-50 text-gray-600 border-gray-200",
};

interface Record {
  id: string;
  type: string;
  date: Date;
  notes: string | null;
}

interface Props {
  leaseId: string;
  records: Record[];
}

export function EvictionPanel({ leaseId, records }: Props) {
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "notice", date: new Date().toISOString().split("T")[0], notes: "" });
  const router = useRouter();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading("add");
    await addEvictionRecord(leaseId, form);
    setAdding(false);
    setForm({ type: "notice", date: new Date().toISOString().split("T")[0], notes: "" });
    setLoading(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setLoading(id);
    await deleteEvictionRecord(id, leaseId);
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {records.length === 0 && !adding && (
        <p className="text-sm text-gray-400">No eviction events recorded.</p>
      )}

      {records.length > 0 && (
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="flex items-start gap-3">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 mt-0.5 ${TYPE_COLOR[r.type] || TYPE_COLOR.other}`}>
                {EVENT_TYPES.find((t) => t.value === r.type)?.label ?? r.type}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString()}</p>
                {r.notes && <p className="text-sm text-gray-700 mt-0.5">{r.notes}</p>}
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                disabled={loading === r.id}
                className="text-gray-300 hover:text-red-400 transition shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <form onSubmit={handleAdd} className="border border-gray-100 rounded-lg p-4 space-y-3 bg-gray-50">
          <Select label="Event type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          <div>
            <label className="text-xs text-gray-500 block mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="e.g. Filed in County Court, case #2024-CV-1234"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C4622D]/30 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading === "add"}>{loading === "add" ? "Saving…" : "Add Event"}</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>+ Add Event</Button>
      )}
    </div>
  );
}
