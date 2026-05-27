import { Suspense } from "react";
import { TenantAuthClient } from "./client";

export default function TenantAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><p className="text-gray-500">Signing you in…</p></div>}>
      <TenantAuthClient />
    </Suspense>
  );
}
