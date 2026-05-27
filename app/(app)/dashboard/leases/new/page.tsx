import { Suspense } from "react";
import { NewLeaseClient } from "./client";
import { requireServerUser } from "@/lib/auth";

export default async function NewLeasePage() {
  const user = await requireServerUser();
  const defaults = {
    lateFeeEnabled: user.defaultLateFeeEnabled,
    lateFeeType: user.defaultLateFeeType as "flat" | "percent",
    lateFeeAmount: user.defaultLateFeeAmount > 0 ? String(user.defaultLateFeeAmount) : "",
    lateFeeGracePeriodDays: String(user.defaultLateFeeGraceDays),
  };
  return (
    <Suspense fallback={<div className="p-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <NewLeaseClient defaults={defaults} />
    </Suspense>
  );
}
