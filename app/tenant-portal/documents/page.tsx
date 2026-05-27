import { requireTenantUser } from "@/lib/tenant-auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function TenantDocumentsPage() {
  const session = await requireTenantUser();

  const documents = await prisma.document.findMany({
    where: {
      landlordId: session.landlordId,
      OR: [
        { leaseId: session.leaseId },
        { lease: { tenants: { some: { tenantId: session.tenantId } } } },
      ],
    },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-dark">Documents</h1>
      <p className="text-sm text-gray-500">Documents shared by your landlord.</p>

      {documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500">No documents available.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-gray-400" />
                <div>
                  <p className="font-medium text-sm text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-400">{formatDate(doc.uploadedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="gray" className="capitalize">{doc.docType}</Badge>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary">
                  <Download size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
