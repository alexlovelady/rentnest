import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default async function MessagesPage() {
  const user = await requireServerUser();

  const leases = await prisma.lease.findMany({
    where: { landlordId: user.id, messages: { some: {} } },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      tenants: { include: { tenant: { select: { name: true } } } },
      unit: { include: { property: true } },
    },
  });

  // Sort by most recent message
  leases.sort((a, b) => {
    const at = a.messages[0]?.createdAt?.getTime() ?? 0;
    const bt = b.messages[0]?.createdAt?.getTime() ?? 0;
    return bt - at;
  });

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-dark mb-6">Messages</h1>

      {leases.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No messages yet. Messages from tenants will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leases.map((lease) => {
            const lastMsg = lease.messages[0];
            const tenantNames = lease.tenants.map((lt) => lt.tenant.name).join(", ");
            const addr = `${lease.unit.property.address}, Unit ${lease.unit.unitNumber}`;
            const needsReply = lastMsg?.senderRole === "tenant";

            return (
              <Link
                key={lease.id}
                href={`/dashboard/leases/${lease.id}#messages`}
                className="flex items-start gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:border-primary/30 hover:shadow-sm transition"
              >
                {/* Unread indicator */}
                <div className="mt-1 shrink-0">
                  {needsReply ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={`text-sm font-semibold truncate ${needsReply ? "text-slate-dark" : "text-gray-700"}`}>
                      {tenantNames}
                    </p>
                    {lastMsg && (
                      <p className="text-xs text-gray-400 shrink-0">
                        {new Date(lastMsg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mb-1">{addr}</p>
                  {lastMsg && (
                    <p className={`text-sm truncate ${needsReply ? "text-gray-800" : "text-gray-400"}`}>
                      {lastMsg.senderRole === "landlord" ? "You: " : ""}{lastMsg.body}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
