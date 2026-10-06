-- Writers (Escritores): public profiles created in the panel, separate from accounts.
CREATE TABLE "Writer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Writer_pkey" PRIMARY KEY ("id")
);

-- One writer per account that already has posts. Same id, so /autor/<id> links keep working.
INSERT INTO "Writer" ("id", "name", "avatarUrl", "coverUrl", "bio", "updatedAt")
SELECT u."id", u."name", u."avatarUrl", u."coverUrl", u."bio", CURRENT_TIMESTAMP
FROM "User" u
WHERE EXISTS (SELECT 1 FROM "Post" p WHERE p."authorId" = u."id");

-- The founder's photo and bio live in the sidebar block; copy them to her writer profile.
UPDATE "Writer" w
SET "bio" = COALESCE(NULLIF(w."bio", ''), b."fields"::jsonb ->> 'bio'),
    "avatarUrl" = COALESCE(NULLIF(w."avatarUrl", ''), NULLIF(b."fields"::jsonb ->> 'avatarUrl', ''))
FROM "SiteBlock" b
WHERE b."id" = 'sidebar.author'
  AND lower(trim(b."fields"::jsonb ->> 'name')) = lower(trim(w."name"));

ALTER TABLE "Post" ADD COLUMN "writerId" TEXT;
UPDATE "Post" SET "writerId" = "authorId";
ALTER TABLE "Post" ALTER COLUMN "writerId" SET NOT NULL;

ALTER TABLE "Post" ADD CONSTRAINT "Post_writerId_fkey" FOREIGN KEY ("writerId") REFERENCES "Writer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
