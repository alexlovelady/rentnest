"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface MonthData {
  month: string;
  income: number;
  expenses: number;
}

function formatK(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;
}

export function IncomeChart({ data }: { data: MonthData[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Income vs Expenses</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="30%" barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatK} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === "income" ? "Income" : "Expenses"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #f3f4f6", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
          />
          <Bar dataKey="income" fill="#C4622D" radius={[4, 4, 0, 0]} name="income" />
          <Bar dataKey="expenses" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
