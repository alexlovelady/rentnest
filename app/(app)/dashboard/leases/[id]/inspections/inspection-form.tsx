"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createInspection } from "./actions";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

const ROOMS = ["Living Room", "Kitchen", "Master Bedroom", "Bedroom 2", "Bathroom", "Master Bathroom", "Hallway", "Laundry Room", "Garage", "Basement", "Yard / Exterior", "Other"];
const CONDITIONS = [
  { value: "good", label: "Good", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "fair", label: "Fair", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "poor", label: "Poor", color: "bg-red-100 text-red-700 border-red-200" },
];

interface Item {
  room: string;
  condition: string;
  notes: string;
}

interface Props {
  leaseId: string;
  onCancel: () => void;
}

export function InspectionForm({ leaseId, onCancel }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("move_in");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([{ room: ROOMS[0], condition: "good", notes: "" }]);

  function addItem() {
    setItems((prev) => [...prev, { room: ROOMS[0], condition: "good", notes: "" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof Item, value: string) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await createInspection(leaseId, { type, date, notes, items });
    setLoading(false);
    router.refresh();
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-100 rounded-xl p-5 space-y-5 bg-gray-50">
      <h3 className="font-semibold text-[#1A2332]">New Inspection</h3>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="move_in">Move-In</option>
          <option value="move_out">Move-Out</option>
        </Select>
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">Overall Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="e.g. Unit generally clean, minor scuffs on walls"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C4622D]/30 resize-none"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Rooms / Areas</p>
          <button type="button" onClick={addItem} className="text-xs text-[#C4622D] hover:underline flex items-center gap-1">
            <Plus size={12} /> Add room
          </button>
        </div>

        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-100 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <select
                  value={item.room}
                  onChange={(e) => updateItem(i, "room", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#C4622D]/30"
                >
                  {ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-1">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => updateItem(i, "condition", c.value)}
                    className={`text-xs px-2 py-1 rounded-full border font-medium transition ${item.condition === c.value ? c.color : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-400 shrink-0">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <input
              type="text"
              value={item.notes}
              onChange={(e) => updateItem(i, "notes", e.target.value)}
              placeholder="Notes (e.g. small scratch on door)"
              className="w-full text-xs border border-gray-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#C4622D]/30"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Inspection"}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
