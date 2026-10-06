-- The "En este ecosistema conviven" accordion now reads from the categories.
-- Carry over the descriptions written in the old accordion block, then the original texts.
UPDATE "Category" c
SET "description" = item->>'description'
FROM "SiteBlock" b, jsonb_array_elements(b."fields"::jsonb -> 'items') AS item
WHERE b."id" = 'home.ecosystem'
  AND lower(trim(item->>'title')) = lower(trim(c."name"))
  AND coalesce(item->>'description', '') <> '';

UPDATE "Category" SET "description" = 'Taller de poesía que nombra la poesía desde la balanza emocional y técnica para introducirse en las profundidades del lenguaje. Además, cuenta con una capa comunitaria que promueve la cultura de paz.'
WHERE "slug" = 'nostalgia-del-paraiso' AND coalesce("description", '') = '';
UPDATE "Category" SET "description" = 'Un grupo de escritoras que promueven la lectura y se ayudan mutuamente.'
WHERE "slug" = 'olas-de-pleamar' AND coalesce("description", '') = '';
UPDATE "Category" SET "description" = 'Aquí escriben escritores de nuestra comunidad que son bienvenidos para dejar su huella en este espacio literario.'
WHERE "slug" = 'voces-del-sur' AND coalesce("description", '') = '';
UPDATE "Category" SET "description" = 'Círculo de lectura cuyo tema fundamental es la cultura de paz: un espacio donde la lectura es un acto de resistencia frente a las fuerzas que deshumanizan.'
WHERE "slug" = 'cultura-de-paz' AND coalesce("description", '') = '';

-- Card titles were a separate copy of the name; a rename now updates everything.
UPDATE "Category" SET "cardTitle" = NULL;
