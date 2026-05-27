CREATE TABLE "Vendor" (
  "id" TEXT NOT NULL,
  "landlordId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "trade" TEXT NOT NULL DEFAULT 'general',
  "phone" TEXT,
  "email" TEXT,
  "website" TEXT,
  "notes" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Vendor_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "Landlord"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

ALTER TABLE "MaintenanceRequest" ADD COLUMN "vendorId" TEXT;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
