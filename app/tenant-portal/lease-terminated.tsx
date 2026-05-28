import { formatDate } from "@/lib/utils";

interface Tenant { name: string }
interface Lease {
  startDate: Date;
  endDate: Date | null;
  terminatedAt?: Date | null;
  unit: { unitNumber: string; property: { address: string } };
}

export default function LeaseTerminatedPage({ tenant, lease }: { tenant: Tenant; lease: Lease }) {
  const addr = `${lease.unit.property.address}, Unit ${lease.unit.unitNumber}`;
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
        <p className="text-4xl mb-4">🏠</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Your lease has ended</h1>
        <p className="text-sm text-gray-500 mb-1">Hi {tenant.name},</p>
        <p className="text-sm text-gray-500 mb-4">
          Your lease at <strong>{addr}</strong> has been terminated
          {lease.terminatedAt ? ` on ${formatDate(lease.terminatedAt)}` : ""}.
        </p>
        <p className="text-sm text-gray-400">If you have questions, please contact your landlord directly.</p>
      </div>
    </div>
  );
}
