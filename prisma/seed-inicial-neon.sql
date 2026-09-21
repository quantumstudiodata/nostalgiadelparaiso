-- Datos iniciales / actualización de contenido para Nostalgia del paraíso.
-- Pega y ejecuta esto en Neon: dashboard del proyecto -> "SQL Editor".
-- Es seguro volver a correrlo: actualiza el contenido si ya existía.

INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES
  ('5b734550-fe10-4d2e-8a23-1a2834a51d6d', 'Administrador', 'admin@nostalgiadelparaiso.com', '$2b$10$0.F38CBGJd7frbtjL21RXOLoyGvoncSvRnqxplQuWRfGS3.3s9Jee', 'ADMIN', now(), now()),
  ('70df61ac-aab0-4933-8e45-a64a14d573e3', 'Ángeles Nava', 'angeles@nostalgiadelparaiso.com', '$2b$10$2PjDyf0akMEpfFdOjHwyYeEOY4Tg/8GkVYyjuG/a5YzM8YrZTKl3C', 'EDITOR', now(), now())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Category" (id, name, slug, "order", "cardTitle", description)
VALUES
  ('b4b213b3-a2f3-48a7-8339-b6875869b2b2', 'Blog de Ángeles Nava', 'blog-angeles-nava', 0, 'Blog Ángeles Nava', NULL),
  ('366afbe6-91cd-4def-95a8-1a5781af679c', 'Nostalgia del paraíso', 'nostalgia-del-paraiso', 1, 'Textos del Taller: Nostalgia del paraíso', 'Este espacio nace con el deseo de difundir la cultura de paz y dar voz a los alumnos del taller de poesía "Nostalgia del Paraíso". Aquí encontrarás un maravilloso universo de letras poéticas y más. Esta es tu casa virtual. La palabra es mía, tuya y de todos.'),
  ('49c9109c-34a9-4792-99b8-11e9232f748e', 'Olas de Pleamar', 'olas-de-pleamar', 2, 'Textos del Taller Olas de pleamar', NULL),
  ('86f7fcee-3617-4161-8487-80a7a6e285d3', 'Voces del Sur', 'voces-del-sur', 3, 'Textos de voces del sur', 'Esta sección es parte de nuestro hogar literario que abre sus puertas a la comunidad para intercambiar su escritura, sus ideas, temas, estilos, tonos y miradas. Entre más voces encontremos para compartir más avivaremos las llamas del fuego literario.

Aquí no sólo se comparten palabras sino también líneas íntimas, subversivas o intensas. Las que cada participante despliega a través de sus textos poéticos, narrativos, ensayísticos, etc. Un espacio donde las palabras crecen y se transforman juntas.'),
  ('61d9fe12-6333-40c3-9e71-e16cb91aa893', 'Cultura de Paz', 'cultura-de-paz', 4, 'Círculo de lectura "Nostalgia del paraíso"', 'El círculo de lectura "Nostalgia del paraíso" es una comunidad que analiza textos vinculados al tema de "Cultura de Paz", lee, dialoga y actúa desde lo íntimo y lo colectivo, que entiende la fragilidad del ser humano, pero también su fortaleza. Cada análisis de texto es un recordatorio de nuestra postura crítica frente a la violencia, de que debemos mantenernos firmes frente a las fuerzas que deshumanizan y reconocer que la paz no es ausencia de conflicto, sino la posibilidad de transformar la experiencia en palabra, aprendizaje, empatía y encuentro.')
ON CONFLICT (slug) DO UPDATE SET
  "cardTitle" = EXCLUDED."cardTitle",
  description = EXCLUDED.description,
  "order" = EXCLUDED."order";

INSERT INTO "SiteBlock" (id, page, label, fields, "updatedAt")
VALUES
  ('home.hero', 'home', 'Portada (Hero)', '{"title":"Bienvenidos a Nostalgia del paraíso","buttonText":"Leer más","body":"Nostalgia del Paraíso: es un ecosistema cultural: una red viva de actividades, personas, textos, ideas y espacios que se conectan entre sí para formar comunidad. No es sólo un taller, ni sólo un círculo de lectura, ni una charla aislada: es la interacción entre todos ellos. En este ecosistema conviven: la cultura de paz, la poesía, la lectura, la inclusión, la reflexión, la comunidad y la presencia digital. Cada elemento alimenta a los otros. La lectura fortalece la paz; la paz abre la palabra; la palabra crea comunidad; la comunidad sostiene la cultura.\n\nUn ecosistema cultural es eso: un conjunto de prácticas que, al unirse, generan un ambiente donde la cultura puede florecer y transformar vidas.\n\nEl Taller de poesía \"Nostalgia del paraíso\": es un taller que nombra la poesía desde la balanza emocional y técnica para introducirse en las profundidades del lenguaje. Adicionalmente, el taller cuenta con una capa comunitaria que promueve la cultura de paz.\n\nEl Círculo de lectura \"Nostalgia del paraíso\", cuyo tema fundamental es la cultura de paz: promueve un espacio donde se utiliza la lectura como acto de resistencia, en términos culturales o simbólicos es un espacio que se mantiene firme frente a las fuerzas que deshumanizan.\n\nEl Taller \"Olas de pleamar\": es un grupo de escritoras que promueven la lectura y se ayudan mutuamente.\n\nVoces del sur: aquí escriben escritores de nuestra comunidad que son bienvenidos para dejar su huella en este espacio literario.","imageUrl":""}'::jsonb, now()),
  ('home.about', 'home', 'Conoce a Ángeles Nava', '{"bio":"Escritora, tallerista y promotora de Cultura de Paz. Me gusta difundir la cultura de paz y acompañar a personas sensibles que buscan en la palabra un espacio de expresión, transformación y encuentro con el mundo.","buttonText":"Leer más","imageUrl":""}'::jsonb, now()),
  ('sidebar.author', 'blog', 'Ficha de autora (barra lateral del blog)', '{"name":"Ángeles Nava","bio":"Tallerista, escritora y promotora de Cultura de Paz (mediadora de lectura del programa nacional de salas de lectura).\n\nDiseñé este espacio Nostalgia del Paraíso con el deseo de difundir la cultura de paz y dar voz a mis alumnos del taller: Nostalgia del paraíso, del taller al que pertenezco: Olas de Pleamar y a otras voces que deseen dejar su huella en este espacio literario.\n\nMe defino con una gran sensibilidad y observación para la creación de textos literarios.\n\nMe gusta encontrarme con gente que le interese la lectura, la escritura y generar conversaciones significativas.","avatarUrl":""}'::jsonb, now())
ON CONFLICT (id) DO UPDATE SET
  fields = EXCLUDED.fields,
  "updatedAt" = now();
