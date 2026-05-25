"use client";
import { useRouter, useSearchParams } from "next/navigation";

interface Property { id: string; nickname: string }
const CATEGORIES = ["mortgage", "taxes", "insurance", "repairs", "maintenance", "utilities", "management", "advertising", "legal", "supplies", "other"];
const YEARS = [2023, 2024, 2025, 2026];

export function ExpenseFilters({ properties, currentProperty, currentCategory, currentYear }: {
  properties: Property[];
  currentProperty?: string;
  currentCategory?: string;
  currentYear: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/dashboard/expenses?${params.toString()}`);
  }

  return (
    <div className="flex gap-3 mb-6 flex-wrap text-sm">
      <select
        className="border border-gray-200 rounded-lg px-3 py-1.5"
        defaultValue={currentProperty || ""}
        onChange={(e) => update("property", e.target.value)}
      >
        <option value="">All properties</option>
        {properties.map((p) => <option key={p.id} value={p.id}>{p.nickname}</option>)}
      </select>
      <select
        className="border border-gray-200 rounded-lg px-3 py-1.5"
        defaultValue={currentCategory || ""}
        onChange={(e) => update("category", e.target.value)}
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
      </select>
      <select
        className="border border-gray-200 rounded-lg px-3 py-1.5"
        defaultValue={String(currentYear)}
        onChange={(e) => update("year", e.target.value)}
      >
        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}
