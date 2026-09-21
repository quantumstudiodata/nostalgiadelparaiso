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
    { name: "Blog de Ángeles Nava", slug: "blog-angeles-nava" },
    { name: "Nostalgia del paraíso", slug: "nostalgia-del-paraiso" },
    { name: "Olas de Pleamar", slug: "olas-de-pleamar" },
    { name: "Cultura de Paz", slug: "cultura-de-paz" },
    { name: "Voces del Sur", slug: "voces-del-sur" },
  ];

  for (const [order, category] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: { ...category, order },
    });
  }

  await prisma.siteBlock.upsert({
    where: { id: "home.hero" },
    update: {},
    create: {
      id: "home.hero",
      page: "home",
      label: "Portada (Hero)",
      fields: {
        title: "Bienvenidos a Nostalgia del paraíso",
        buttonText: "Leer más",
        body: "Nostalgia del Paraíso: es un ecosistema cultural: una red viva de actividades, personas, textos, ideas y espacios que se conectan entre sí para formar comunidad.",
      },
    },
  });

  await prisma.siteBlock.upsert({
    where: { id: "home.about" },
    update: {},
    create: {
      id: "home.about",
      page: "home",
      label: "Conoce a Ángeles Nava",
      fields: {
        bio: "Escritora, tallerista y promotora de Cultura de Paz. Me gusta difundir la cultura de paz y acompañar a personas sensibles que buscan en la palabra un espacio de expresión, transformación y encuentro con el mundo.",
        buttonText: "Leer más",
        imageUrl: "",
      },
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
