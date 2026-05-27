-- AlterTable
ALTER TABLE "Landlord" ADD COLUMN "showEmailToTenants" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Landlord" ADD COLUMN "showPhoneToTenants" BOOLEAN NOT NULL DEFAULT false;
