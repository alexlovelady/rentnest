"use client";
import { useRouter } from "next/navigation";

const YEARS = [2023, 2024, 2025, 2026];

export function ReportYearSelect({ currentYear, currentReport }: { currentYear: number; currentReport: string }) {
  const router = useRouter();
  return (
    <select
      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
      defaultValue={currentYear}
      onChange={(e) => router.push(`/dashboard/reports?year=${e.target.value}&report=${currentReport}`)}
    >
      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
    </select>
  );
}
