"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireServerUser } from "@/lib/auth";

const DEFAULT_QUESTIONS = [
  { order: 0, label: "What is your current address?", type: "text", options: [], required: true },
  { order: 1, label: "What is your gross monthly income?", type: "number", options: [], required: true },
  { order: 2, label: "What is your employment status?", type: "select", options: ["Employed full-time", "Employed part-time", "Self-employed", "Retired", "Student", "Other"], required: true },
  { order: 3, label: "How many people will occupy the unit?", type: "number", options: [], required: true },
  { order: 4, label: "Do you have pets?", type: "yesno", options: [], required: true },
  { order: 5, label: "Do you smoke?", type: "yesno", options: [], required: true },
  { order: 6, label: "What is your desired move-in date?", type: "text", options: [], required: true },
  { order: 7, label: "Why are you moving from your current home?", type: "text", options: [], required: false },
  { order: 8, label: "Have you ever been evicted?", type: "yesno", options: [], required: true },
  { order: 9, label: "May we contact your current landlord for a reference?", type: "yesno", options: [], required: false },
];

export async function createQuiz(data: { title: string; propertyId?: string; unitId?: string }) {
  const user = await requireServerUser();
  const quiz = await prisma.screeningQuiz.create({
    data: {
      landlordId: user.id,
      title: data.title,
      propertyId: data.propertyId || null,
      unitId: data.unitId || null,
      questions: { create: DEFAULT_QUESTIONS },
    },
  });
  revalidatePath("/dashboard/screening");
  return quiz;
}

export async function addQuestion(quizId: string, label: string, type: string = "text") {
  const user = await requireServerUser();
  const quiz = await prisma.screeningQuiz.findFirst({ where: { id: quizId, landlordId: user.id } });
  if (!quiz) throw new Error("Not found");
  const count = await prisma.screeningQuestion.count({ where: { quizId } });
  await prisma.screeningQuestion.create({
    data: { quizId, label, type, options: [], required: false, order: count },
  });
  revalidatePath(`/dashboard/screening/${quizId}`);
}

export async function deleteQuestion(quizId: string, questionId: string) {
  const user = await requireServerUser();
  const quiz = await prisma.screeningQuiz.findFirst({ where: { id: quizId, landlordId: user.id } });
  if (!quiz) throw new Error("Not found");
  await prisma.screeningQuestion.delete({ where: { id: questionId } });
  revalidatePath(`/dashboard/screening/${quizId}`);
}

export async function updateResponseStatus(quizId: string, responseId: string, status: string) {
  const user = await requireServerUser();
  const quiz = await prisma.screeningQuiz.findFirst({ where: { id: quizId, landlordId: user.id } });
  if (!quiz) throw new Error("Not found");
  await prisma.screeningResponse.update({ where: { id: responseId }, data: { status } });
  revalidatePath(`/dashboard/screening/${quizId}`);
}

export async function updateResponseNotes(quizId: string, responseId: string, notes: string) {
  const user = await requireServerUser();
  const quiz = await prisma.screeningQuiz.findFirst({ where: { id: quizId, landlordId: user.id } });
  if (!quiz) throw new Error("Not found");
  await prisma.screeningResponse.update({ where: { id: responseId }, data: { notes } });
  revalidatePath(`/dashboard/screening/${quizId}`);
}

export async function deactivateQuiz(quizId: string) {
  const user = await requireServerUser();
  await prisma.screeningQuiz.updateMany({
    where: { id: quizId, landlordId: user.id },
    data: { isActive: false },
  });
  revalidatePath("/dashboard/screening");
}
