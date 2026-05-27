import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ApplyForm } from "./apply-form";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ quizId: string }> }): Promise<Metadata> {
  const { quizId } = await params;
  const quiz = await prisma.screeningQuiz.findFirst({
    where: { id: quizId, isActive: true },
    select: { title: true },
  });
  return { title: quiz?.title || "Rental Application", robots: { index: false } };
}

export default async function ApplyPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;

  const quiz = await prisma.screeningQuiz.findFirst({
    where: { id: quizId, isActive: true },
    include: {
      property: { select: { nickname: true, address: true, city: true, state: true } },
      unit: { select: { unitNumber: true, bedrooms: true, bathrooms: true } },
      questions: { orderBy: { order: "asc" } },
      landlord: { select: { name: true } },
    },
  });

  if (!quiz) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="RentNest" className="h-10 w-auto mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-slate-dark">{quiz.title}</h1>
          {quiz.property && (
            <p className="text-sm text-gray-500 mt-1">
              {quiz.property.nickname} — {quiz.property.address}, {quiz.property.city}, {quiz.property.state}
              {quiz.unit ? ` · Unit ${quiz.unit.unitNumber}` : ""}
              {quiz.unit ? ` · ${quiz.unit.bedrooms}bd/${quiz.unit.bathrooms}ba` : ""}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">Managed by {quiz.landlord.name}</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <p className="text-sm text-gray-600 mb-6">
            Please fill out this form completely. Your landlord will review your application and follow up by email.
          </p>
          <ApplyForm quizId={quizId} questions={quiz.questions} />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Powered by <img src="/logo.jpg" alt="RentNest" className="h-5 w-auto inline-block align-middle opacity-50 ml-1" /></p>
      </div>
    </div>
  );
}
