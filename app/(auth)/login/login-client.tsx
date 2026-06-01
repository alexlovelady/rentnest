"use client";
import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error("Session failed");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg.includes("invalid-credential") ? "Invalid email or password" : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email address above, then click Forgot password.");
      return;
    }
    setError("");
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch {
      setError("Could not send reset email. Check the address and try again.");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-dark mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500">Sign in to your RentNest account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <div>
          <Input label="Password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          <div className="flex justify-end mt-1">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="text-xs text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
            >
              {resetLoading ? "Sending…" : "Forgot password?"}
            </button>
          </div>
        </div>
        {resetSent && (
          <p className="text-sm text-green-600">Password reset email sent — check your inbox.</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="text-sm text-gray-500 text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Start free trial
        </Link>
      </p>
    </div>
  );
}
