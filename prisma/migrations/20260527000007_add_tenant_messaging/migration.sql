CREATE TABLE "LeaseMessage" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "tenantId" TEXT,
    "senderRole" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaseMessage_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "LeaseMessage" ADD CONSTRAINT "LeaseMessage_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaseMessage" ADD CONSTRAINT "LeaseMessage_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
