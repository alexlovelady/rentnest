"use client";
import { useState } from "react";
import { submitSupport } from "@/lib/actions/support";
import { LifeBuoy, X } from "lucide-react";

const TYPES = ["Bug Report", "Feature Request", "Question", "Billing Issue", "Other"];

export function SupportButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(TYPES[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleOpen() {
    setOpen(true);
    setSent(false);
    setError("");
    setMessage("");
    setType(TYPES[0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await submitSupport(type, message);
      setSent(true);
      setTimeout(() => setOpen(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 w-full transition-colors"
      >
        <LifeBuoy size={16} />
        Support
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-[#12121e] rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 border border-gray-100 dark:border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Support</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            {sent ? (
              <div className="py-8 text-center">
                <p className="text-2xl mb-2">✓</p>
                <p className="text-green-600 dark:text-green-400 font-medium">Message sent — we'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ colorScheme: "light" }}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="Describe your issue or question…"
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-gray-400 dark:placeholder:text-white/25"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 dark:text-white/40 dark:hover:text-white transition">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition"
                  >
                    {loading ? "Sending…" : "Send"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
