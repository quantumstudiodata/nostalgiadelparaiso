import { prisma } from "@/lib/prisma";
import { requireManagerPage } from "@/lib/permissions";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireManagerPage();
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="px-5 md:px-10 py-9">
      <h1 className="font-bold text-[28px]">Categorías</h1>
      <p className="mt-1 text-[15px] text-neutral-600">
        Renombra, agrega u ordena los ecosistemas. El nombre nuevo aparece en todo el sitio: en el inicio, en “Talleres y voces de la comunidad” y en las listas de entradas.
      </p>
      <CategoriesManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description ?? "",
          imageUrl: c.imageUrl ?? "",
          inEcosystem: c.inEcosystem,
          posts: c._count.posts,
        }))}
      />
    </div>
  );
}
