import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { FileText, Download, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UploadDocumentModal } from "./upload-document-modal";

const docTypeColor: Record<string, "blue" | "green" | "yellow" | "gray"> = {
  lease: "blue",
  inspection: "green",
  notice: "yellow",
  insurance: "green",
  permit: "gray",
  addendum: "blue",
  other: "gray",
};

export default async function DocumentsPage() {
  const user = await requireServerUser();

  const documents = await prisma.document.findMany({
    where: { landlordId: user.id },
    include: {
      property: { select: { nickname: true } },
      lease: { include: { unit: { include: { property: true } } } },
    },
    orderBy: { uploadedAt: "desc" },
  });

  const properties = await prisma.property.findMany({ where: { landlordId: user.id, isActive: true }, select: { id: true, nickname: true } });
  const leases = await prisma.lease.findMany({ where: { landlordId: user.id, status: "active" }, include: { unit: { include: { property: true } }, tenants: { include: { tenant: true } } } });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#1A2332]">Documents</h1>
        <UploadDocumentModal properties={properties} leases={leases} />
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FolderOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-400">
                    {doc.property?.nickname || (doc.lease ? `${doc.lease.unit.property.address} Unit ${doc.lease.unit.unitNumber}` : "General")}
                    {" · "}{formatDate(doc.uploadedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={docTypeColor[doc.docType] || "gray"} className="capitalize">{doc.docType}</Badge>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#C4622D] transition">
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
