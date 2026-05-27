"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InspectionForm } from "./inspection-form";
import { deleteInspection } from "./actions";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

const CONDITION_COLOR: Record<string, string> = {
  good: "bg-green-50 text-green-700 border-green-200",
  fair: "bg-yellow-50 text-yellow-700 border-yellow-200",
  poor: "bg-red-50 text-red-700 border-red-200",
};

interface InspectionItem {
  id: string;
  room: string;
  condition: string;
  notes: string | null;
}

interface InspectionReport {
  id: string;
  type: string;
  date: Date;
  notes: string | null;
  items: InspectionItem[];
}

interface Props {
  leaseId: string;
  reports: InspectionReport[];
}

function ReportCard({ report, leaseId }: { report: InspectionReport; leaseId: string }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    await deleteInspection(report.id, leaseId);
    setDeleting(false);
    router.refresh();
  }

  const typeLabel = report.type === "move_in" ? "Move-In" : "Move-Out";
  const typeColor = report.type === "move_in" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-orange-50 text-orange-700 border-orange-200";

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColor}`}>{typeLabel}</span>
          <span className="text-sm text-gray-700">{new Date(report.date).toLocaleDateString()}</span>
          <span className="text-xs text-gray-400">{report.items.length} rooms</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} disabled={deleting} className="text-gray-300 hover:text-red-400 transition">
            <Trash2 size={13} />
          </button>
          {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-3 space-y-2">
          {report.notes && <p className="text-sm text-gray-600 mb-3">{report.notes}</p>}
          {report.items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 text-sm">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 mt-0.5 ${CONDITION_COLOR[item.condition] || CONDITION_COLOR.good}`}>
                {item.condition}
              </span>
              <div>
                <p className="font-medium text-gray-800">{item.room}</p>
                {item.notes && <p className="text-xs text-gray-500 mt-0.5">{item.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function InspectionList({ leaseId, reports }: Props) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {reports.length === 0 && !adding && (
        <p className="text-sm text-gray-400">No inspection reports yet.</p>
      )}

      {reports.map((r) => (
        <ReportCard key={r.id} report={r} leaseId={leaseId} />
      ))}

      {adding ? (
        <InspectionForm leaseId={leaseId} onCancel={() => setAdding(false)} />
      ) : (
        <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>+ New Inspection</Button>
      )}
    </div>
  );
}
