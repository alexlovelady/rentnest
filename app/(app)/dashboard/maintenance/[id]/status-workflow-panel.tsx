"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateMaintenanceStatus, updateMaintenanceDetails } from "../actions";
import { useRouter } from "next/navigation";

const STATUS_FLOW = ["open", "in_progress", "scheduled", "resolved"] as const;

interface Request {
  id: string;
  status: string;
  vendorName: string | null;
  vendorPhone: string | null;
  scheduledFor: Date | null;
  estimatedCost: number | null;
  actualCost: number | null;
}

export function StatusWorkflowPanel({ request }: { request: Request }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [vendor, setVendor] = useState(request.vendorName || "");
  const [vendorPhone, setVendorPhone] = useState(request.vendorPhone || "");
  const [scheduledFor, setScheduledFor] = useState(request.scheduledFor ? new Date(request.scheduledFor).toISOString().split("T")[0] : "");
  const [estimatedCost, setEstimatedCost] = useState(request.estimatedCost?.toString() || "");
  const [actualCost, setActualCost] = useState(request.actualCost?.toString() || "");
  const router = useRouter();

  const currentIdx = STATUS_FLOW.indexOf(request.status as typeof STATUS_FLOW[number]);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  async function handleStatusChange(status: string) {
    setLoading(true);
    await updateMaintenanceStatus(request.id, status, notes);
    router.refresh();
    setLoading(false);
  }

  async function handleSaveDetails() {
    setLoading(true);
    await updateMaintenanceDetails(request.id, {
      vendorName: vendor || undefined,
      vendorPhone: vendorPhone || undefined,
      scheduledFor: scheduledFor || undefined,
      estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
      actualCost: actualCost ? Number(actualCost) : undefined,
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {nextStatus && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Next Step</p>
          {nextStatus === "resolved" && (
            <Textarea
              label="Resolution notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was done to resolve this?"
            />
          )}
          <Button
            className="w-full mt-3 capitalize"
            onClick={() => handleStatusChange(nextStatus)}
            disabled={loading}
          >
            Mark {nextStatus.replace("_", " ")}
          </Button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Scheduling & Cost</p>
        <Input label="Vendor name" value={vendor} onChange={(e) => setVendor(e.target.value)} />
        <Input label="Vendor phone" value={vendorPhone} onChange={(e) => setVendorPhone(e.target.value)} />
        <Input label="Scheduled date" type="date" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
        <Input label="Estimated cost ($)" type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} />
        <Input label="Actual cost ($)" type="number" value={actualCost} onChange={(e) => setActualCost(e.target.value)} />
        <Button variant="secondary" className="w-full" onClick={handleSaveDetails} disabled={loading}>
          Save Details
        </Button>
      </div>
    </div>
  );
}
