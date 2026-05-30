"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";

function formatK(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;
}

const PIE_COLORS = ["#C4622D", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

interface MonthlyData { month: string; income: number; expenses: number; net: number }
interface CategoryData { name: string; value: number }

export function IncomeExpenseChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barCategoryGap="30%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatK} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={42} />
          <Tooltip
            formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name === "income" ? "Income" : name === "expenses" ? "Expenses" : "Net"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #f3f4f6" }}
          />
          <Bar dataKey="income" fill="#C4622D" radius={[3, 3, 0, 0]} name="income" />
          <Bar dataKey="expenses" fill="#e5e7eb" radius={[3, 3, 0, 0]} name="expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NetIncomeChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Net Income Trend</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C4622D" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#C4622D" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatK} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={42} />
          <Tooltip
            formatter={(v: number) => [`$${v.toLocaleString()}`, "Net income"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #f3f4f6" }}
          />
          <Area type="monotone" dataKey="net" stroke="#C4622D" strokeWidth={2} fill="url(#netGrad)" dot={{ r: 3, fill: "#C4622D" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpensePieChart({ data }: { data: CategoryData[] }) {
  if (data.length === 0) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #f3f4f6" }}
          />
          <Legend
            formatter={(value) => <span style={{ fontSize: 11, color: "#6b7280", textTransform: "capitalize" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
