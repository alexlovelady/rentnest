import { requireServerUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ billing?: string; connect?: string }> }) {
  const { billing, connect } = await searchParams;
  const user = await requireServerUser();

  const daysLeft = user.trialEndsAt
    ? Math.max(0, Math.ceil((user.trialEndsAt.getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-dark mb-8">Settings</h1>

      {billing === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-800 font-medium">Subscription activated! Welcome to RentNest.</p>
        </div>
      )}
      {connect === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-800 font-medium">Bank account connected! Tenants can now pay rent online.</p>
        </div>
      )}

      <SettingsClient user={user} daysLeft={daysLeft} />
    </div>
  );
}
