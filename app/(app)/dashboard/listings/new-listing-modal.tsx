"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createListing } from "./actions";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface VacantUnit {
  id: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  property: { nickname: string };
}

interface Quiz {
  id: string;
  title: string;
}

export function NewListingModal({ vacantUnits, quizzes, preselectedUnitId }: { vacantUnits: VacantUnit[]; quizzes: Quiz[]; preselectedUnitId?: string }) {
  const [open, setOpen] = useState(!!preselectedUnitId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(preselectedUnitId || "");
  const router = useRouter();

  function autoTitle() {
    const u = vacantUnits.find((u) => u.id === selectedUnit);
    if (!u) return "";
    return `${u.bedrooms}BD/${u.bathrooms}BA — ${u.property.nickname}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await createListing({
        unitId: fd.get("unitId") as string,
        quizId: (fd.get("quizId") as string) || undefined,
        title: fd.get("title") as string,
        description: (fd.get("description") as string) || undefined,
        askingRent: parseFloat(fd.get("askingRent") as string),
        availableAt: (fd.get("availableAt") as string) || undefined,
      });
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create listing.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> New Listing</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="List a Unit">
        <form onSubmit={handleSubmit} className="space-y-4">
          {vacantUnits.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No vacant units available. All units are currently occupied or have active listings.</p>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                <select
                  name="unitId"
                  required
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select a unit…</option>
                  {vacantUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.property.nickname} — Unit {u.unitNumber} ({u.bedrooms}bd/{u.bathrooms}ba)
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Listing title"
                id="title"
                name="title"
                required
                defaultValue={autoTitle()}
                key={selectedUnit}
                placeholder="e.g. 2BD/1BA in Oak Street Duplex"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Asking rent ($/mo)" id="askingRent" name="askingRent" type="number" min="0" step="1" required placeholder="1200" />
                <Input label="Available date" id="availableAt" name="availableAt" type="date" />
              </div>
              <Textarea label="Description (optional)" id="description" name="description" placeholder="Spacious apartment in a quiet neighborhood…" />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Screening quiz (optional)</label>
                <select
                  name="quizId"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">None — applicants can&apos;t apply online</option>
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>{q.title}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Applicants clicking "Apply" will fill out this quiz.</p>
              </div>
            </>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            {vacantUnits.length > 0 && (
              <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create Listing"}</Button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}
