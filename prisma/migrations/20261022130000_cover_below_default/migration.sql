ALTER TABLE "Post" ALTER COLUMN "coverPlacement" SET DEFAULT 'below';
UPDATE "Post" SET "coverPlacement" = 'below' WHERE "coverPlacement" = 'both';
