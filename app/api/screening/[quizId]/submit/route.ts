import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { emailBase, greeting, detailTable, muted } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;

  const quiz = await prisma.screeningQuiz.findFirst({
    where: { id: quizId, isActive: true },
    include: {
      questions: { orderBy: { order: "asc" } },
      landlord: { select: { email: true, name: true } },
      property: { select: { nickname: true, address: true } },
    },
  });

  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const body = await req.json();
  const { name, email, phone, answers, coApplicants } = body as {
    name: string;
    email: string;
    phone?: string;
    answers: Record<string, string>;
    coApplicants?: { name: string; email: string; phone?: string }[];
  };

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const response = await prisma.screeningResponse.create({
    data: {
      quizId,
      applicantName: name.trim(),
      applicantEmail: email.trim().toLowerCase(),
      applicantPhone: phone?.trim() || null,
      answers: {
        create: quiz.questions
          .filter((q) => answers[q.id] !== undefined)
          .map((q) => ({ questionId: q.id, answer: answers[q.id] || "" })),
      },
      coApplicants: coApplicants?.length
        ? {
            create: coApplicants
              .filter((c) => c.name?.trim() && c.email?.trim())
              .map((c) => ({ name: c.name.trim(), email: c.email.trim().toLowerCase(), phone: c.phone?.trim() || null })),
          }
        : undefined,
    },
  });

  // Email landlord
  const coRows: [string, string][] = (coApplicants ?? [])
    .filter((c) => c.name?.trim())
    .flatMap((c, i) => {
      const label = `Co-applicant ${i + 1}`;
      const rows: [string, string][] = [[label, c.name]];
      if (c.email) rows.push([`${label} email`, c.email]);
      if (c.phone) rows.push([`${label} phone`, c.phone]);
      return rows;
    });

  const rows: [string, string][] = [
    ["Applicant", name],
    ["Email", email],
    ...(phone ? [["Phone", phone] as [string, string]] : []),
    ...coRows,
    ...quiz.questions
      .filter((q) => answers[q.id])
      .map((q) => [q.label, answers[q.id]] as [string, string]),
  ];

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@rentnest.app",
      to: quiz.landlord.email,
      subject: `New screening response: ${name} — ${quiz.title}`,
      html: emailBase(`
        ${greeting(quiz.landlord.name)}
        <p>A new applicant has submitted a pre-screening response for <strong>${quiz.title}</strong>${quiz.property ? ` (${quiz.property.nickname})` : ""}.</p>
        ${detailTable(rows)}
        <p style="margin-top:16px;">
          <a href="${APP_URL}/dashboard/screening/${quizId}" style="color:#C4622D;">Review in RentNest →</a>
        </p>
        ${muted("Reply directly to this email to contact the applicant.")}
      `),
      replyTo: email,
    });
  } catch {
    // Email failure is non-fatal
  }

  return NextResponse.json({ success: true, responseId: response.id });
}
