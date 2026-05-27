"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { createQuiz } from "./actions";
import { useRouter } from "next/navigation";

export function NewQuizModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const quiz = await createQuiz({ title: fd.get("title") as string });
      setOpen(false);
      router.push(`/dashboard/screening/${quiz.id}`);
    } catch {
      setError("Failed to create quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><Plus size={14} /> New Quiz</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create Screening Quiz">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Quiz title"
            id="title"
            name="title"
            required
            defaultValue="Rental Application"
            placeholder="e.g. Oak Street Duplex — Unit 2 Application"
          />
          <p className="text-xs text-gray-500">
            10 standard screening questions are added automatically. You can customize them after creating.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create Quiz"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
