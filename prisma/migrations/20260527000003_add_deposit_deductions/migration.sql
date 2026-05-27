ALTER TABLE "Lease" ADD COLUMN "securityDepositPaidAt" TIMESTAMP;
ALTER TABLE "Lease" ADD COLUMN "securityDepositReturnedAt" TIMESTAMP;

CREATE TABLE "DepositDeduction" (
  "id" TEXT NOT NULL,
  "leaseId" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DepositDeduction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DepositDeduction_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
