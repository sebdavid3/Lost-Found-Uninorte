-- AlterTable
ALTER TABLE "Object" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'AVAILABLE';

-- CreateIndex
CREATE INDEX "Object_category_idx" ON "Object"("category");
CREATE INDEX "Object_location_idx" ON "Object"("location");
CREATE INDEX "Object_foundAt_idx" ON "Object"("foundAt");

-- CreateIndex
CREATE INDEX "Claim_userId_idx" ON "Claim"("userId");
CREATE INDEX "Claim_objectId_idx" ON "Claim"("objectId");
CREATE INDEX "Claim_status_idx" ON "Claim"("status");
CREATE INDEX "Claim_objectId_status_idx" ON "Claim"("objectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_userId_objectId_key" ON "Claim"("userId", "objectId");

-- CreateIndex
CREATE INDEX "Evidence_claimId_idx" ON "Evidence"("claimId");
