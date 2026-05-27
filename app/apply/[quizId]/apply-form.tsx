"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

type Question = {
  id: string;
  label: string;
  type: string;
  options: string[];
  required: boolean;
};

type CoApplicant = { name: string; email: string; phone: string };

export function ApplyForm({ quizId, questions }: { quizId: string; questions: Question[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [coApplicants, setCoApplicants] = useState<CoApplicant[]>([]);
  const router = useRouter();

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function addCoApplicant() {
    setCoApplicants((prev) => [...prev, { name: "", email: "", phone: "" }]);
  }

  function updateCoApplicant(i: number, field: keyof CoApplicant, value: string) {
    setCoApplicants((prev) => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  }

  function removeCoApplicant(i: number) {
    setCoApplicants((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const phone = fd.get("phone") as string;

    try {
      const res = await fetch(`/api/screening/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, answers, coApplicants }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
      router.push(`/apply/${quizId}/thank-you`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Primary applicant */}
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name <span className="text-red-500">*</span></label>
          <input name="name" required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Jane Smith" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email address <span className="text-red-500">*</span></label>
          <input name="email" type="email" required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="jane@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
          <input name="phone" type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="(555) 000-0000" />
        </div>
      </div>

      {/* Co-applicants */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-gray-700">Co-applicants</p>
          <button type="button" onClick={addCoApplicant} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus size={12} /> Add co-applicant
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">Couples, roommates, or co-signers applying together.</p>

        {coApplicants.map((co, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-600">Co-applicant {i + 1}</p>
              <button type="button" onClick={() => removeCoApplicant(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
            <input
              placeholder="Full name *"
              required
              value={co.name}
              onChange={(e) => updateCoApplicant(i, "name", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            />
            <input
              placeholder="Email address *"
              type="email"
              required
              value={co.email}
              onChange={(e) => updateCoApplicant(i, "email", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            />
            <input
              placeholder="Phone (optional)"
              type="tel"
              value={co.phone}
              onChange={(e) => updateCoApplicant(i, "phone", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            />
          </div>
        ))}
      </div>

      {/* Screening questions */}
      {questions.length > 0 && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          {questions.map((q) => (
            <div key={q.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {q.label}{q.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {q.type === "yesno" && (
                <div className="flex gap-3">
                  {["Yes", "No"].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={q.id} value={opt} required={q.required} onChange={() => setAnswer(q.id, opt)} className="accent-primary" />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === "select" && (
                <select required={q.required} onChange={(e) => setAnswer(q.id, e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" defaultValue="">
                  <option value="" disabled>Select one…</option>
                  {q.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              )}

              {q.type === "number" && (
                <input type="number" required={q.required} min={0} onChange={(e) => setAnswer(q.id, e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0" />
              )}

              {q.type === "text" && (
                <input type="text" required={q.required} onChange={(e) => setAnswer(q.id, e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}

      <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white font-medium rounded-lg py-3 text-sm transition-colors disabled:opacity-50">
        {loading ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}
