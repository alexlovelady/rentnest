"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MonthData { month: string; income: number; expenses: number }

function formatK(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;
}

export function IncomeChart({ data }: { data: MonthData[] }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const gridStroke = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tickColor = dark ? "#6b6b85" : "#9ca3af";
  const expenseFill = dark ? "#2a2a3e" : "#e5e7eb";
  const tooltip = dark
    ? { backgroundColor: "#12121e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#e2e8f0" }
    : { border: "1px solid #f3f4f6", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Income vs Expenses</h2>
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary inline-block" />Income</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: expenseFill }} />Expenses</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="35%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatK} tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} width={38} />
          <Tooltip
            formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name === "income" ? "Income" : "Expenses"]}
            contentStyle={tooltip}
            cursor={{ fill: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
          />
          <Bar dataKey="income" fill="#C4622D" radius={[3, 3, 0, 0]} name="income" />
          <Bar dataKey="expenses" fill={expenseFill} radius={[3, 3, 0, 0]} name="expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
