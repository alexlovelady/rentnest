"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function TenantAuthClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setError("Invalid link — no token found."); return; }

    fetch("/api/tenant-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(async (res) => {
      if (res.ok) {
        router.replace("/tenant-portal");
      } else {
        const data = await res.json();
        setError(data.error || "This link is invalid or expired. Please ask your landlord for a new one.");
      }
    });
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-medium mb-2">Link expired or invalid</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="text-gray-500">Signing you in…</p>
    </div>
  );
}
