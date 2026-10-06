-- Separates "already emailed to subscribers" from the editable publish date.
ALTER TABLE "Post" ADD COLUMN "announcedAt" TIMESTAMP(3);
UPDATE "Post" SET "announcedAt" = COALESCE("publishedAt", CURRENT_TIMESTAMP) WHERE "status" = 'PUBLISHED';
