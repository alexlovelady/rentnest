-- AlterTable: Tenant insurance fields
ALTER TABLE "Tenant" ADD COLUMN "insuranceProvider" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "insurancePolicyNumber" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "insuranceExpiresAt" TIMESTAMP(3);

-- AlterTable: Unit utility fields
ALTER TABLE "Unit" ADD COLUMN "utilitiesIncluded" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Unit" ADD COLUMN "utilitiesNote" TEXT;
