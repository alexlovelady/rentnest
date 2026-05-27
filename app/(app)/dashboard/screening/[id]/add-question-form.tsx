"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { addQuestion } from "../actions";
import { useRouter } from "next/navigation";

export function AddQuestionForm({ quizId }: { quizId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState("");
  const [type, setType] = useState("text");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setLoading(true);
    await addQuestion(quizId, label.trim(), type);
    setLabel("");
    setType("text");
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mt-2"
      >
        <Plus size={14} /> Add custom question
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 mt-2">
      <div className="flex-1">
        <Input
          label="Question"
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
          autoFocus
          placeholder="e.g. Do you have a co-signer?"
        />
      </div>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="h-9 border border-gray-200 rounded-lg text-sm px-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="text">Text</option>
        <option value="yesno">Yes / No</option>
        <option value="number">Number</option>
      </select>
      <Button type="submit" size="sm" disabled={loading}>{loading ? "Adding…" : "Add"}</Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
    </form>
  );
}
