"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markDepositReceived, addDepositDeduction, removeDepositDeduction, markDepositReturned } from "../actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Deduction {
  id: string;
  description: string;
  amount: number;
  createdAt: Date;
}

interface Props {
  leaseId: string;
  securityDeposit: number;
  securityDepositPaid: boolean;
  securityDepositPaidAt: Date | null;
  securityDepositHeld: number;
  securityDepositReturnedAt: Date | null;
  deductions: Deduction[];
}

export function DepositPanel({
  leaseId,
  securityDeposit,
  securityDepositPaid,
  securityDepositPaidAt,
  securityDepositHeld,
  securityDepositReturnedAt,
  deductions,
}: Props) {
  const [addingDeduction, setAddingDeduction] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleMarkReceived() {
    setLoading("received");
    await markDepositReceived(leaseId);
    setLoading(null);
    router.refresh();
  }

  async function handleAddDeduction() {
    if (!description || !amount) return;
    setLoading("deduction");
    await addDepositDeduction(leaseId, description, parseFloat(amount));
    setDescription("");
    setAmount("");
    setAddingDeduction(false);
    setLoading(null);
    router.refresh();
  }

  async function handleRemoveDeduction(id: string) {
    setLoading(id);
    await removeDepositDeduction(id, leaseId);
    setLoading(null);
    router.refresh();
  }

  async function handleMarkReturned() {
    setLoading("returned");
    await markDepositReturned(leaseId);
    setLoading(null);
    router.refresh();
  }

  const totalDeducted = deductions.reduce((s, d) => s + d.amount, 0);
  const returnAmount = Math.max(0, securityDeposit - totalDeducted);

  if (securityDeposit === 0) {
    return <p className="text-sm text-gray-400">No security deposit for this lease.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Deposit amount</p>
          <p className="font-semibold">{formatCurrency(securityDeposit)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Received</p>
          {securityDepositPaid ? (
            <p className="text-green-600 font-medium">{securityDepositPaidAt ? formatDate(securityDepositPaidAt) : "Yes"}</p>
          ) : (
            <Button size="sm" variant="secondary" onClick={handleMarkReceived} disabled={loading === "received"}>
              {loading === "received" ? "Saving…" : "Mark received"}
            </Button>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500">Deducted</p>
          <p className={totalDeducted > 0 ? "font-semibold text-red-600" : "text-gray-500"}>{totalDeducted > 0 ? formatCurrency(totalDeducted) : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">
            {securityDepositReturnedAt ? "Returned" : "To return"}
          </p>
          {securityDepositReturnedAt ? (
            <p className="text-green-600 font-medium">{formatDate(securityDepositReturnedAt)}</p>
          ) : (
            <p className="font-semibold">{formatCurrency(returnAmount)}</p>
          )}
        </div>
      </div>

      {/* Deductions */}
      {(deductions.length > 0 || addingDeduction) && (
        <div className="border border-gray-100 rounded-lg overflow-hidden">
          {deductions.length > 0 && (
            <div className="divide-y divide-gray-50">
              {deductions.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-gray-700">{d.description}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-red-600">{formatCurrency(d.amount)}</span>
                    {!securityDepositReturnedAt && (
                      <button
                        onClick={() => handleRemoveDeduction(d.id)}
                        disabled={loading === d.id}
                        className="text-gray-300 hover:text-red-400 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {addingDeduction && (
            <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-100">
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#C4622D]/30"
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={0}
                step="0.01"
                className="w-24 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#C4622D]/30"
              />
              <Button size="sm" onClick={handleAddDeduction} disabled={loading === "deduction"}>Add</Button>
              <Button size="sm" variant="secondary" onClick={() => { setAddingDeduction(false); setDescription(""); setAmount(""); }}>Cancel</Button>
            </div>
          )}
        </div>
      )}

      {!securityDepositReturnedAt && securityDepositPaid && (
        <div className="flex gap-2 flex-wrap">
          {!addingDeduction && (
            <Button size="sm" variant="secondary" onClick={() => setAddingDeduction(true)}>Add Deduction</Button>
          )}
          <Button size="sm" variant="secondary" onClick={handleMarkReturned} disabled={loading === "returned"}>
            {loading === "returned" ? "Saving…" : `Mark Returned (${formatCurrency(returnAmount)})`}
          </Button>
        </div>
      )}
    </div>
  );
}
