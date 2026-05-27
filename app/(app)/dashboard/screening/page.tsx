import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { NewQuizModal } from "./new-quiz-modal";
import { CopyLinkButton } from "./copy-link-button";
import { formatDate } from "@/lib/utils";

export default async function ScreeningPage() {
  const user = await requireServerUser();

  const quizzes = await prisma.screeningQuiz.findMany({
    where: { landlordId: user.id, isActive: true },
    include: {
      property: { select: { nickname: true } },
      unit: { select: { unitNumber: true } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">Screening Quizzes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Share a link with applicants to collect pre-screening information before showing a unit.
          </p>
        </div>
        <NewQuizModal />
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No screening quizzes yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create a quiz to start collecting applicant information.</p>
          <NewQuizModal />
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => {
            const applyUrl = `${APP_URL}/apply/${quiz.id}`;
            return (
              <div key={quiz.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/screening/${quiz.id}`}
                      className="font-semibold text-gray-900 hover:text-primary transition-colors"
                    >
                      {quiz.title}
                    </Link>
                    {(quiz.property || quiz.unit) && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {quiz.property?.nickname}{quiz.unit ? ` · Unit ${quiz.unit.unitNumber}` : ""}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">Created {formatDate(quiz.createdAt)}</p>
                    <p className="text-xs text-gray-400 mt-2 truncate font-mono">{applyUrl}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{quiz._count.responses}</p>
                    <p className="text-xs text-gray-500">response{quiz._count.responses !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Link
                    href={`/dashboard/screening/${quiz.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    View responses
                  </Link>
                  <span className="text-xs text-gray-300">·</span>
                  <CopyLinkButton url={applyUrl} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
