import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CopyLinkButton } from "../copy-link-button";
import { AddQuestionForm } from "./add-question-form";
import { DeleteQuestionButton } from "./delete-question-button";
import { ResponseStatusSelect } from "./response-status-select";

const TYPE_LABEL: Record<string, string> = {
  text: "Text",
  yesno: "Yes / No",
  number: "Number",
  select: "Multiple choice",
};

const STATUS_BADGE: Record<string, "green" | "yellow" | "red" | "gray"> = {
  approved: "green",
  pending: "yellow",
  rejected: "red",
};

export default async function ScreeningDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireServerUser();

  const quiz = await prisma.screeningQuiz.findFirst({
    where: { id, landlordId: user.id },
    include: {
      property: { select: { nickname: true } },
      unit: { select: { unitNumber: true } },
      questions: { orderBy: { order: "asc" } },
      responses: {
        include: {
          answers: { include: { question: true } },
          coApplicants: true,
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!quiz) notFound();

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const applyUrl = `${APP_URL}/apply/${quiz.id}`;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <Link href="/dashboard/screening" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <ArrowLeft size={14} /> Screening Quizzes
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-dark">{quiz.title}</h1>
          {(quiz.property || quiz.unit) && (
            <p className="text-sm text-gray-500 mt-0.5">
              {quiz.property?.nickname}{quiz.unit ? ` · Unit ${quiz.unit.unitNumber}` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CopyLinkButton url={applyUrl} />
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
          >
            <ExternalLink size={12} /> Preview
          </a>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Questions ({quiz.questions.length})</h2>
        <div className="space-y-2">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="flex items-center justify-between gap-3 py-1.5">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs text-gray-400 w-5 shrink-0">{i + 1}.</span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-800">{q.label}</p>
                  <p className="text-xs text-gray-400">{TYPE_LABEL[q.type] || q.type}{q.required ? "" : " · optional"}</p>
                </div>
              </div>
              <DeleteQuestionButton quizId={quiz.id} questionId={q.id} />
            </div>
          ))}
        </div>
        <AddQuestionForm quizId={quiz.id} />
      </div>

      {/* Responses */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold text-gray-900">Responses</h2>
          <span className="text-sm text-gray-400">({quiz.responses.length})</span>
        </div>

        {quiz.responses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Users size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No responses yet. Share the link to start collecting applications.</p>
            <div className="mt-3 flex justify-center">
              <CopyLinkButton url={applyUrl} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {quiz.responses.map((response) => (
              <div key={response.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{response.applicantName}</p>
                    <p className="text-sm text-gray-500">{response.applicantEmail}</p>
                    {response.applicantPhone && <p className="text-sm text-gray-500">{response.applicantPhone}</p>}
                    {response.coApplicants.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {response.coApplicants.map((co) => (
                          <p key={co.id} className="text-xs text-gray-500">+ {co.name} ({co.email})</p>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Submitted {formatDate(response.submittedAt)}</p>
                  </div>
                  <ResponseStatusSelect
                    quizId={quiz.id}
                    responseId={response.id}
                    status={response.status}
                  />
                </div>
                <div className="grid gap-2 border-t border-gray-50 pt-4">
                  {response.answers.map((answer) => (
                    <div key={answer.id} className="grid grid-cols-[1fr,1fr] gap-2 text-sm">
                      <p className="text-gray-500">{answer.question.label}</p>
                      <p className="text-gray-900 font-medium">{answer.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
