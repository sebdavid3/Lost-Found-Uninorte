-- AlterTable
ALTER TABLE "Object" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';

-- Update existing objects to use description as name
UPDATE "Object" SET "name" = LEFT("description", 50) WHERE "name" = '';

-- Remove the default after backfill
ALTER TABLE "Object" ALTER COLUMN "name" DROP DEFAULT;
