import { Suspense } from "react";
import { NewLeaseClient } from "./client";

export default function NewLeasePage() {
  return (
    <Suspense fallback={<div className="p-8"><div className="w-6 h-6 border-2 border-[#C4622D] border-t-transparent rounded-full animate-spin" /></div>}>
      <NewLeaseClient />
    </Suspense>
  );
}
