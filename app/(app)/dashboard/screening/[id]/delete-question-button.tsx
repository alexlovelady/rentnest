"use client";
import { Trash2 } from "lucide-react";
import { deleteQuestion } from "../actions";
import { useRouter } from "next/navigation";

export function DeleteQuestionButton({ quizId, questionId }: { quizId: string; questionId: string }) {
  const router = useRouter();

  async function handleDelete() {
    await deleteQuestion(quizId, questionId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-gray-300 hover:text-red-500 transition-colors"
      title="Remove question"
    >
      <Trash2 size={14} />
    </button>
  );
}
