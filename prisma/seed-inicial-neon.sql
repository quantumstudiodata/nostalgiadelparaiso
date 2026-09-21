-- Datos iniciales para Nostalgia del paraíso.
-- Pega y ejecuta esto en Neon: dashboard del proyecto -> "SQL Editor".
-- Solo necesitas correrlo UNA VEZ, después de que Vercel haya aplicado
-- las migraciones (el primer deploy exitoso ya crea las tablas).

INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES
  ('5b734550-fe10-4d2e-8a23-1a2834a51d6d', 'Administrador', 'admin@nostalgiadelparaiso.com', '$2b$10$0.F38CBGJd7frbtjL21RXOLoyGvoncSvRnqxplQuWRfGS3.3s9Jee', 'ADMIN', now(), now()),
  ('70df61ac-aab0-4933-8e45-a64a14d573e3', 'Ángeles Nava', 'angeles@nostalgiadelparaiso.com', '$2b$10$2PjDyf0akMEpfFdOjHwyYeEOY4Tg/8GkVYyjuG/a5YzM8YrZTKl3C', 'EDITOR', now(), now())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Category" (id, name, slug, "order")
VALUES
  ('b4b213b3-a2f3-48a7-8339-b6875869b2b2', 'Blog de Ángeles Nava', 'blog-angeles-nava', 0),
  ('366afbe6-91cd-4def-95a8-1a5781af679c', 'Nostalgia del paraíso', 'nostalgia-del-paraiso', 1),
  ('49c9109c-34a9-4792-99b8-11e9232f748e', 'Olas de Pleamar', 'olas-de-pleamar', 2),
  ('61d9fe12-6333-40c3-9e71-e16cb91aa893', 'Cultura de Paz', 'cultura-de-paz', 3),
  ('86f7fcee-3617-4161-8487-80a7a6e285d3', 'Voces del Sur', 'voces-del-sur', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "SiteBlock" (id, page, label, fields, "updatedAt")
VALUES
  ('home.hero', 'home', 'Portada (Hero)', '{"title":"Bienvenidos a Nostalgia del paraíso","buttonText":"Leer más","body":"Nostalgia del Paraíso: es un ecosistema cultural: una red viva de actividades, personas, textos, ideas y espacios que se conectan entre sí para formar comunidad."}'::jsonb, now()),
  ('home.about', 'home', 'Conoce a Ángeles Nava', '{"bio":"Escritora, tallerista y promotora de Cultura de Paz. Me gusta difundir la cultura de paz y acompañar a personas sensibles que buscan en la palabra un espacio de expresión, transformación y encuentro con el mundo.","buttonText":"Leer más","imageUrl":""}'::jsonb, now())
ON CONFLICT (id) DO NOTHING;
