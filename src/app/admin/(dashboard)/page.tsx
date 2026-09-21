import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="h-[72px] shrink-0 border-b border-neutral-200 flex items-center justify-between px-8">
        <div>
          <h1 className="font-serif text-[22px]">Entradas</h1>
          <div className="text-xs text-neutral-500 mt-0.5">
            {posts.length} {posts.length === 1 ? "entrada" : "entradas"} en total
          </div>
        </div>
        <Link
          href="/admin/entradas/nueva"
          className="bg-accent text-white text-sm px-5 py-2.5 rounded-lg"
        >
          + Nueva entrada
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[56px_1fr_170px_130px_120px_60px] px-4 py-3 text-[11px] uppercase tracking-wide text-neutral-400 border-b border-neutral-100">
            <div />
            <div>Título</div>
            <div>Categoría</div>
            <div>Fecha</div>
            <div>Estado</div>
            <div />
          </div>

          {posts.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-neutral-500">
              Aún no hay entradas. Crea la primera con &quot;Nueva entrada&quot;.
            </div>
          )}

          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/entradas/${post.id}`}
              className="grid grid-cols-[56px_1fr_170px_130px_120px_60px] items-center px-4 py-2.5 border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
            >
              <div className="w-10 h-10 rounded-md bg-neutral-100 overflow-hidden">
                {post.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="text-sm font-semibold pr-3 truncate">{post.title}</div>
              <div className="text-xs text-neutral-500">{post.category.name}</div>
              <div className="text-xs text-neutral-500">
                {post.createdAt.toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
              <div>
                <span
                  className={`text-[11px] px-2.5 py-1 rounded-full ${
                    post.status === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {post.status === "PUBLISHED" ? "Publicada" : "Borrador"}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 text-xs text-neutral-500 flex items-center gap-1.5">
          Aquí solo administras contenido: título, texto, imágenes y categoría.
          El diseño y la estructura del sitio los gestiona tu agencia.
        </div>
      </div>
    </div>
  );
}
