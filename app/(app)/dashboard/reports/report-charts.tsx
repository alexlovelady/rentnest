"use client";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

function useDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function formatK(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;
}

const PIE_COLORS = ["#C4622D", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

interface MonthlyData { month: string; income: number; expenses: number; net: number }
interface CategoryData { name: string; value: number }

export function IncomeExpenseChart({ data }: { data: MonthlyData[] }) {
  const dark = useDark();
  const grid = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tick = dark ? "#6b6b85" : "#9ca3af";
  const expFill = dark ? "#2a2a3e" : "#e5e7eb";
  const tip = dark ? { backgroundColor: "#12121e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#e2e8f0" } : { border: "1px solid #f3f4f6", borderRadius: 8, fontSize: 12 };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barCategoryGap="35%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatK} tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} width={42} />
          <Tooltip formatter={(v, n) => [`$${Number(v).toLocaleString()}`, n === "income" ? "Income" : "Expenses"]} contentStyle={tip} cursor={{ fill: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
          <Bar dataKey="income" fill="#C4622D" radius={[3, 3, 0, 0]} name="income" />
          <Bar dataKey="expenses" fill={expFill} radius={[3, 3, 0, 0]} name="expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NetIncomeChart({ data }: { data: MonthlyData[] }) {
  const dark = useDark();
  const grid = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tick = dark ? "#6b6b85" : "#9ca3af";
  const tip = dark ? { backgroundColor: "#12121e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#e2e8f0" } : { border: "1px solid #f3f4f6", borderRadius: 8, fontSize: 12 };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Net Income Trend</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C4622D" stopOpacity={dark ? 0.25 : 0.15} />
              <stop offset="95%" stopColor="#C4622D" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={grid} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatK} tick={{ fontSize: 11, fill: tick }} axisLine={false} tickLine={false} width={42} />
          <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Net income"]} contentStyle={tip} cursor={{ stroke: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
          <Area type="monotone" dataKey="net" stroke="#C4622D" strokeWidth={2} fill="url(#netGrad)" dot={{ r: 3, fill: "#C4622D" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpensePieChart({ data }: { data: CategoryData[] }) {
  const dark = useDark();
  if (data.length === 0) return null;
  const tip = dark ? { backgroundColor: "#12121e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "#e2e8f0" } : { border: "1px solid #f3f4f6", borderRadius: 8, fontSize: 12 };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v, n) => [`$${Number(v).toLocaleString()}`, n]} contentStyle={tip} />
          <Legend formatter={(v) => <span style={{ fontSize: 11, color: dark ? "#9ca3af" : "#6b7280", textTransform: "capitalize" }}>{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
