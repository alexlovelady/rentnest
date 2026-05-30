"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, format, addMonths, subMonths, isToday,
} from "date-fns";

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  subtitle?: string;
  type: "rent" | "lease" | "maintenance" | "inspection";
  href: string;
}

const TYPE_STYLES = {
  rent:        "bg-primary/90 text-white",
  lease:       "bg-amber-500/90 text-white",
  maintenance: "bg-blue-500/90 text-white",
  inspection:  "bg-emerald-500/90 text-white",
};

const TYPE_DOT = {
  rent:        "bg-primary",
  lease:       "bg-amber-500",
  maintenance: "bg-blue-500",
  inspection:  "bg-emerald-500",
};

export function CalendarClient({ events }: { events: CalendarEvent[] }) {
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  function eventsForDay(day: Date) {
    return events.filter((e) => isSameDay(new Date(e.date), day));
  }

  const selectedEvents = selected ? eventsForDay(selected) : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-dark">{format(current, "MMMM yyyy")}</h2>
        <div className="flex gap-1">
          <button onClick={() => setCurrent(subMonths(current, 1))} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrent(new Date())} className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm text-gray-500 transition">
            Today
          </button>
          <button onClick={() => setCurrent(addMonths(current, 1))} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {(["rent", "lease", "maintenance", "inspection"] as const).map((t) => (
          <span key={t} className="flex items-center gap-1.5 text-gray-500">
            <span className={`w-2 h-2 rounded-full ${TYPE_DOT[t]}`} />
            {t === "rent" ? "Rent due" : t === "lease" ? "Lease expiring" : t === "maintenance" ? "Maintenance" : "Inspection"}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayEvents = eventsForDay(day);
            const isCurrentMonth = isSameMonth(day, current);
            const today = isToday(day);
            const isSelected = selected && isSameDay(day, selected);

            return (
              <button
                key={i}
                onClick={() => setSelected(isSelected ? null : day)}
                className={`min-h-[72px] sm:min-h-[90px] p-1.5 text-left border-b border-r border-gray-50 last:border-r-0 transition-colors
                  ${!isCurrentMonth ? "bg-gray-50/50" : "hover:bg-gray-50"}
                  ${isSelected ? "bg-primary/5 border-primary/20 ring-1 ring-inset ring-primary/20" : ""}
                `}
              >
                <div className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium mb-1
                  ${today ? "bg-primary text-white" : isCurrentMonth ? "text-gray-700" : "text-gray-300"}
                `}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <div key={e.id} className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate ${TYPE_STYLES[e.type]}`}>
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-gray-400 px-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selected && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">{format(selected, "EEEE, MMMM d, yyyy")}</h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-gray-400">No events on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((e) => (
                <Link key={e.id} href={e.href} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition group">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${TYPE_DOT[e.type]}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800 group-hover:text-primary transition">{e.title}</p>
                    {e.subtitle && <p className="text-xs text-gray-400">{e.subtitle}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
