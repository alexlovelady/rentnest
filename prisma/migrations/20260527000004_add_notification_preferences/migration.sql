ALTER TABLE "Landlord" ADD COLUMN "notifyOnLeaseExpiring" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Landlord" ADD COLUMN "notifyOnInsuranceExpiring" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Landlord" ADD COLUMN "notifyOnSignature" BOOLEAN NOT NULL DEFAULT true;
