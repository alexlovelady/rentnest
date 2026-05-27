"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateUtilities } from "../../../actions";
import { useRouter } from "next/navigation";

const UTILITY_OPTIONS = [
  "Water",
  "Gas",
  "Electric",
  "Trash",
  "Internet",
  "Cable",
  "Sewer",
  "Lawn Care",
  "Snow Removal",
];

interface Props {
  unitId: string;
  propertyId: string;
  utilitiesIncluded: string[];
  utilitiesNote: string | null;
}

export function UtilitiesForm({ unitId, propertyId, utilitiesIncluded, utilitiesNote }: Props) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>(utilitiesIncluded);
  const [note, setNote] = useState(utilitiesNote ?? "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function toggle(utility: string) {
    setSelected((prev) =>
      prev.includes(utility) ? prev.filter((u) => u !== utility) : [...prev, utility]
    );
  }

  async function handleSave() {
    setLoading(true);
    await updateUtilities(unitId, propertyId, { utilitiesIncluded: selected, utilitiesNote: note });
    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between">
        <div className="text-sm">
          {utilitiesIncluded.length > 0 ? (
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1.5">
                {utilitiesIncluded.map((u) => (
                  <span key={u} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{u}</span>
                ))}
              </div>
              {utilitiesNote && <p className="text-gray-500 mt-1">{utilitiesNote}</p>}
            </div>
          ) : (
            <p className="text-gray-400">No utilities included (tenant pays all)</p>
          )}
        </div>
        <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
          {utilitiesIncluded.length > 0 ? "Edit" : "Add"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {UTILITY_OPTIONS.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => toggle(u)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              selected.includes(u)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}
          >
            {u}
          </button>
        ))}
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Water included up to $50/mo"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
        <Button size="sm" variant="secondary" onClick={() => { setEditing(false); setSelected(utilitiesIncluded); setNote(utilitiesNote ?? ""); }}>Cancel</Button>
      </div>
    </div>
  );
}
