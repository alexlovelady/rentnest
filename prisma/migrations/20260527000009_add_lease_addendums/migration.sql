CREATE TABLE "LeaseAddendum" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaseAddendum_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AddendumSignature" (
    "id" TEXT NOT NULL,
    "addendumId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "signerName" TEXT,
    "signedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AddendumSignature_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AddendumSignature_token_key" ON "AddendumSignature"("token");

ALTER TABLE "LeaseAddendum" ADD CONSTRAINT "LeaseAddendum_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AddendumSignature" ADD CONSTRAINT "AddendumSignature_addendumId_fkey" FOREIGN KEY ("addendumId") REFERENCES "LeaseAddendum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AddendumSignature" ADD CONSTRAINT "AddendumSignature_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
