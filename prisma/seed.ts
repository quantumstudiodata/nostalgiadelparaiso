import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("changeme-admin", 10);
  const editorPasswordHash = await bcrypt.hash("changeme-editora", 10);

  await prisma.user.upsert({
    where: { email: "admin@nostalgiadelparaiso.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@nostalgiadelparaiso.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "angeles@nostalgiadelparaiso.com" },
    update: {},
    create: {
      name: "Ángeles Nava",
      email: "angeles@nostalgiadelparaiso.com",
      passwordHash: editorPasswordHash,
      role: "EDITOR",
      bio: "Escritora, tallerista y promotora de Cultura de Paz.",
    },
  });

  const categories = [
    {
      name: "Blog de Ángeles Nava",
      slug: "blog-angeles-nava",
      order: 0,
      cardTitle: "Blog Ángeles Nava",
      description: null,
      imageUrl: "/images/angeles-nava.jpeg",
    },
    {
      name: "Nostalgia del paraíso",
      slug: "nostalgia-del-paraiso",
      order: 1,
      cardTitle: "Textos del Taller: Nostalgia del paraíso",
      description:
        'Este espacio nace con el deseo de difundir la cultura de paz y dar voz a los alumnos del taller de poesía "Nostalgia del Paraíso". Aquí encontrarás un maravilloso universo de letras poéticas y más. Esta es tu casa virtual. La palabra es mía, tuya y de todos.',
      imageUrl: "/images/categoria-nostalgia-del-paraiso.png",
    },
    {
      name: "Olas de Pleamar",
      slug: "olas-de-pleamar",
      order: 2,
      cardTitle: "Textos del Taller Olas de pleamar",
      description: null,
      imageUrl: null,
    },
    {
      name: "Voces del Sur",
      slug: "voces-del-sur",
      order: 3,
      cardTitle: "Textos de voces del sur",
      description:
        "Esta sección es parte de nuestro hogar literario que abre sus puertas a la comunidad para intercambiar su escritura, sus ideas, temas, estilos, tonos y miradas. Entre más voces encontremos para compartir más avivaremos las llamas del fuego literario.\n\nAquí no sólo se comparten palabras sino también líneas íntimas, subversivas o intensas. Las que cada participante despliega a través de sus textos poéticos, narrativos, ensayísticos, etc. Un espacio donde las palabras crecen y se transforman juntas.",
      imageUrl: null,
    },
    {
      name: "Cultura de Paz",
      slug: "cultura-de-paz",
      order: 4,
      cardTitle: 'Círculo de lectura "Nostalgia del paraíso"',
      description:
        'El círculo de lectura "Nostalgia del paraíso" es una comunidad que analiza textos vinculados al tema de "Cultura de Paz", lee, dialoga y actúa desde lo íntimo y lo colectivo, que entiende la fragilidad del ser humano, pero también su fortaleza. Cada análisis de texto es un recordatorio de nuestra postura crítica frente a la violencia, de que debemos mantenernos firmes frente a las fuerzas que deshumanizan y reconocer que la paz no es ausencia de conflicto, sino la posibilidad de transformar la experiencia en palabra, aprendizaje, empatía y encuentro.',
      imageUrl: null,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        cardTitle: category.cardTitle,
        description: category.description,
        imageUrl: category.imageUrl,
      },
      create: category,
    });
  }

  await prisma.siteBlock.upsert({
    where: { id: "home.hero" },
    update: {
      fields: {
        title: "Bienvenidos a Nostalgia del paraíso",
        buttonText: "Leer más",
        body: 'Nostalgia del Paraíso: es un ecosistema cultural: una red viva de actividades, personas, textos, ideas y espacios que se conectan entre sí para formar comunidad. No es sólo un taller, ni sólo un círculo de lectura, ni una charla aislada: es la interacción entre todos ellos. En este ecosistema conviven: la cultura de paz, la poesía, la lectura, la inclusión, la reflexión, la comunidad y la presencia digital. Cada elemento alimenta a los otros. La lectura fortalece la paz; la paz abre la palabra; la palabra crea comunidad; la comunidad sostiene la cultura.\n\nUn ecosistema cultural es eso: un conjunto de prácticas que, al unirse, generan un ambiente donde la cultura puede florecer y transformar vidas.\n\nEl Taller de poesía "Nostalgia del paraíso": es un taller que nombra la poesía desde la balanza emocional y técnica para introducirse en las profundidades del lenguaje. Adicionalmente, el taller cuenta con una capa comunitaria que promueve la cultura de paz.\n\nEl Círculo de lectura "Nostalgia del paraíso", cuyo tema fundamental es la cultura de paz: promueve un espacio donde se utiliza la lectura como acto de resistencia, en términos culturales o simbólicos es un espacio que se mantiene firme frente a las fuerzas que deshumanizan.\n\nEl Taller "Olas de pleamar": es un grupo de escritoras que promueven la lectura y se ayudan mutuamente.\n\nVoces del sur: aquí escriben escritores de nuestra comunidad que son bienvenidos para dejar su huella en este espacio literario.',
        imageUrl: "",
      },
    },
    create: {
      id: "home.hero",
      page: "home",
      label: "Portada (Hero)",
      fields: {
        title: "Bienvenidos a Nostalgia del paraíso",
        buttonText: "Leer más",
        body: 'Nostalgia del Paraíso: es un ecosistema cultural: una red viva de actividades, personas, textos, ideas y espacios que se conectan entre sí para formar comunidad. No es sólo un taller, ni sólo un círculo de lectura, ni una charla aislada: es la interacción entre todos ellos. En este ecosistema conviven: la cultura de paz, la poesía, la lectura, la inclusión, la reflexión, la comunidad y la presencia digital. Cada elemento alimenta a los otros. La lectura fortalece la paz; la paz abre la palabra; la palabra crea comunidad; la comunidad sostiene la cultura.\n\nUn ecosistema cultural es eso: un conjunto de prácticas que, al unirse, generan un ambiente donde la cultura puede florecer y transformar vidas.\n\nEl Taller de poesía "Nostalgia del paraíso": es un taller que nombra la poesía desde la balanza emocional y técnica para introducirse en las profundidades del lenguaje. Adicionalmente, el taller cuenta con una capa comunitaria que promueve la cultura de paz.\n\nEl Círculo de lectura "Nostalgia del paraíso", cuyo tema fundamental es la cultura de paz: promueve un espacio donde se utiliza la lectura como acto de resistencia, en términos culturales o simbólicos es un espacio que se mantiene firme frente a las fuerzas que deshumanizan.\n\nEl Taller "Olas de pleamar": es un grupo de escritoras que promueven la lectura y se ayudan mutuamente.\n\nVoces del sur: aquí escriben escritores de nuestra comunidad que son bienvenidos para dejar su huella en este espacio literario.',
        imageUrl: "",
      },
    },
  });

  await prisma.siteBlock.upsert({
    where: { id: "home.about" },
    update: {
      fields: {
        bio: "Escritora, tallerista y promotora de Cultura de Paz. Me gusta difundir la cultura de paz y acompañar a personas sensibles que buscan en la palabra un espacio de expresión, transformación y encuentro con el mundo.",
        buttonText: "Leer más",
        imageUrl: "/images/angeles-nava.jpeg",
      },
    },
    create: {
      id: "home.about",
      page: "home",
      label: "Conoce a Ángeles Nava",
      fields: {
        bio: "Escritora, tallerista y promotora de Cultura de Paz. Me gusta difundir la cultura de paz y acompañar a personas sensibles que buscan en la palabra un espacio de expresión, transformación y encuentro con el mundo.",
        buttonText: "Leer más",
        imageUrl: "/images/angeles-nava.jpeg",
      },
    },
  });

  const sidebarAuthorFields = {
    name: "Ángeles Nava",
    bio: 'Tallerista, escritora y promotora de Cultura de Paz (mediadora de lectura del programa nacional de salas de lectura).\n\nDiseñé este espacio Nostalgia del Paraíso con el deseo de difundir la cultura de paz y dar voz a mis alumnos del taller: Nostalgia del paraíso, del taller al que pertenezco: Olas de Pleamar y a otras voces que deseen dejar su huella en este espacio literario.\n\nMe defino con una gran sensibilidad y observación para la creación de textos literarios.\n\nMe gusta encontrarme con gente que le interese la lectura, la escritura y generar conversaciones significativas.',
    avatarUrl: "/images/angeles-nava.jpeg",
  };

  await prisma.siteBlock.upsert({
    where: { id: "sidebar.author" },
    update: { fields: sidebarAuthorFields },
    create: {
      id: "sidebar.author",
      page: "blog",
      label: "Ficha de autora (barra lateral del blog)",
      fields: sidebarAuthorFields,
    },
  });

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
