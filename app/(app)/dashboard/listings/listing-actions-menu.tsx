"use client";
import { useState } from "react";
import { updateListingStatus, deleteListing } from "./actions";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive (hidden)" },
  { value: "rented", label: "Rented" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-500 border-gray-200",
  rented: "bg-blue-50 text-blue-700 border-blue-200",
};

export function ListingStatusSelect({ listingId, status }: { listingId: string; status: string }) {
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as "active" | "inactive" | "rented";
    setLoading(true);
    await updateListingStatus(listingId, next);
    setCurrent(next);
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={loading}
      className={`text-xs border rounded-full px-2 py-0.5 font-medium capitalize focus:outline-none ${STATUS_STYLES[current] || ""}`}
    >
      {STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Remove this listing?")) return;
    setLoading(true);
    await deleteListing(listingId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
      {loading ? "…" : "Remove"}
    </button>
  );
}
