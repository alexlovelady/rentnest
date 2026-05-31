-- AlterTable
ALTER TABLE "AddendumSignature" ADD COLUMN     "signerIp" TEXT;

-- AlterTable
ALTER TABLE "Landlord" ADD COLUMN     "onboardingDismissed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Lease" ADD COLUMN     "rentStartDate" TIMESTAMP(3),
ADD COLUMN     "stripeDepositUrl" TEXT,
ALTER COLUMN "securityDepositPaidAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "securityDepositReturnedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "address2" TEXT;

-- AlterTable
ALTER TABLE "Unit" ALTER COLUMN "utilitiesIncluded" DROP DEFAULT;

-- CreateTable
CREATE TABLE "MaintenanceComment" (
    "id" TEXT NOT NULL,
    "maintenanceRequestId" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaseSignature" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "signerName" TEXT,
    "signerIp" TEXT,
    "signedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "signedDocumentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaseSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningQuiz" (
    "id" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "propertyId" TEXT,
    "unitId" TEXT,
    "title" TEXT NOT NULL DEFAULT 'Rental Application',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreeningQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "options" TEXT[],
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ScreeningQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningResponse" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "applicantEmail" TEXT NOT NULL,
    "applicantPhone" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "ScreeningResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningCoApplicant" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,

    CONSTRAINT "ScreeningCoApplicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "quizId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "askingRent" DOUBLE PRECISION NOT NULL,
    "availableAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningAnswer" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "ScreeningAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaseSignature_token_key" ON "LeaseSignature"("token");

-- AddForeignKey
ALTER TABLE "MaintenanceComment" ADD CONSTRAINT "MaintenanceComment_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES "MaintenanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaseSignature" ADD CONSTRAINT "LeaseSignature_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaseSignature" ADD CONSTRAINT "LeaseSignature_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningQuiz" ADD CONSTRAINT "ScreeningQuiz_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "Landlord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningQuiz" ADD CONSTRAINT "ScreeningQuiz_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningQuiz" ADD CONSTRAINT "ScreeningQuiz_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningQuestion" ADD CONSTRAINT "ScreeningQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "ScreeningQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningResponse" ADD CONSTRAINT "ScreeningResponse_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "ScreeningQuiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningCoApplicant" ADD CONSTRAINT "ScreeningCoApplicant_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "ScreeningResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "Landlord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "ScreeningQuiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningAnswer" ADD CONSTRAINT "ScreeningAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "ScreeningResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScreeningAnswer" ADD CONSTRAINT "ScreeningAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ScreeningQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
