import { requireTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TenantMessageForm } from "./message-form";

export default async function TenantMessagesPage() {
  const session = await requireTenantUser();

  const messages = await prisma.leaseMessage.findMany({
    where: { leaseId: session.leaseId },
    orderBy: { createdAt: "asc" },
    include: { tenant: { select: { name: true } } },
  });

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { name: true },
  });

  return (
    <div className="space-y-4">
      <Link href="/tenant-portal" className="text-sm text-gray-500 flex items-center gap-1">
        <ArrowLeft size={14} /> Back
      </Link>
      <h1 className="text-xl font-bold text-[#1A2332]">Messages</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400">No messages yet. Send your landlord a message below.</p>
        )}

        {messages.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.senderRole === "tenant" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${m.senderRole === "tenant" ? "bg-[#C4622D] text-white" : "bg-gray-100 text-gray-800"}`}>
                  {m.senderRole === "landlord" && (
                    <p className="text-xs font-medium mb-1 opacity-70">Landlord</p>
                  )}
                  <p>{m.body}</p>
                  <p className={`text-xs mt-1 ${m.senderRole === "tenant" ? "text-white/60" : "text-gray-400"}`}>
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <TenantMessageForm tenantName={tenant?.name ?? "Tenant"} />
      </div>
    </div>
  );
}
