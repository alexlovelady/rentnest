"use client";
import { useState } from "react";
import { updateResponseStatus } from "../actions";
import { useRouter } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export function ResponseStatusSelect({
  quizId,
  responseId,
  status,
}: {
  quizId: string;
  responseId: string;
  status: string;
}) {
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setLoading(true);
    await updateResponseStatus(quizId, responseId, next);
    setCurrent(next);
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      disabled={loading}
      className={`text-xs border rounded-full px-2 py-0.5 font-medium capitalize focus:outline-none ${STATUS_STYLES[current] || ""}`}
    >
      <option value="pending">Pending</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
    </select>
  );
}
