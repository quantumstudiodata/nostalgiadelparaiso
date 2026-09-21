import { prisma } from "@/lib/prisma";
import { updateCategoryContent } from "./actions";

export default async function CategoriesAdminPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col h-screen">
      <div className="h-[72px] shrink-0 border-b border-neutral-200 flex items-center justify-between px-8">
        <div>
          <h1 className="font-serif text-[20px]">Categorías</h1>
          <div className="text-xs text-neutral-500 mt-0.5">
            Edita la tarjeta e introducción de cada categoría del blog
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-4 max-w-3xl">
        {categories.map((category) => {
          const boundUpdate = updateCategoryContent.bind(null, category.id);
          return (
            <form
              key={category.id}
              action={boundUpdate}
              className="bg-white border border-neutral-200 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold">{category.name}</div>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#a35a3a] bg-[#f7e9df] px-2.5 py-1 rounded-full">
                  Estructura bloqueada
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
                    Título de la tarjeta (Inicio)
                  </label>
                  <input
                    name="cardTitle"
                    defaultValue={category.cardTitle ?? ""}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
                    Imagen de la tarjeta (URL)
                  </label>
                  <input
                    name="imageUrl"
                    defaultValue={category.imageUrl ?? ""}
                    placeholder="https://..."
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
                    Texto de introducción (&quot;Acerca de...&quot;)
                  </label>
                  <textarea
                    name="description"
                    defaultValue={category.description ?? ""}
                    rows={4}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <button className="mt-4 bg-accent text-white text-sm px-5 py-2.5 rounded-lg">
                Guardar cambios
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
