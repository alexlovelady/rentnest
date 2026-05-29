import { requireTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";
import { TenantMessageForm } from "./message-form";
import { ScrollAnchor } from "./scroll-anchor";

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
    <div className="flex flex-col" style={{ height: "calc(100dvh - 10rem)" }}>
      <h1 className="text-xl font-bold text-slate-dark mb-4 shrink-0">Messages</h1>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center pt-8">No messages yet. Send your landlord a message below.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderRole === "tenant" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.senderRole === "tenant" ? "bg-primary text-white rounded-br-sm" : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"}`}>
              {m.senderRole === "landlord" && (
                <p className="text-xs font-semibold mb-1 text-gray-500">Landlord</p>
              )}
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p className={`text-xs mt-1.5 ${m.senderRole === "tenant" ? "text-white/60" : "text-gray-400"}`}>
                {new Date(m.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <ScrollAnchor />
      </div>

      <div className="shrink-0 bg-gray-50 rounded-xl border border-gray-100 p-3">
        <TenantMessageForm tenantName={tenant?.name ?? "Tenant"} />
      </div>
    </div>
  );
}
