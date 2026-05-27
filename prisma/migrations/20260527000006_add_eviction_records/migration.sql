CREATE TABLE "EvictionRecord" (
  "id" TEXT NOT NULL,
  "leaseId" TEXT NOT NULL,
  "landlordId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EvictionRecord_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EvictionRecord_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
