import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canWritePosts, isManager } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PostsFilters } from "@/components/admin/posts-filters";

const PAGE_SIZE = 20;

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; categoria?: string; autor?: string; pagina?: string }>;
}) {
  const { q, estado, categoria, autor, pagina } = await searchParams;
  const session = await auth();
  // Readers only have "Cuenta" in their panel.
  if (!canWritePosts(session?.user?.role)) redirect("/admin/cuenta");
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  const manager = isManager(session?.user?.role);
  // Authors only manage their own posts.
  const own: Prisma.PostWhereInput = manager ? {} : { authorId: session?.user?.id ?? "" };

  const query = q?.trim();
  const where: Prisma.PostWhereInput = {
    ...own,
    ...(estado === "publicadas" ? { status: "PUBLISHED" } : {}),
    ...(estado === "borradores" ? { status: "DRAFT" } : {}),
    ...(categoria ? { category: { slug: categoria } } : {}),
    ...(autor ? { writerId: autor } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { writer: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, publishedCount, draftCount, subscriberCount, categories, authors] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.count({ where: { ...own, status: "PUBLISHED" } }),
    prisma.post.count({ where: { ...own, status: "DRAFT" } }),
    manager ? prisma.subscriber.count({ where: { verified: true } }) : Promise.resolve(0),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
    prisma.writer.findMany({ where: { posts: { some: {} } }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(pageCount, Math.max(1, Number(pagina) || 1));
  const posts = await prisma.post.findMany({
    where,
    include: { category: true, writer: true },
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { updatedAt: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (estado) params.set("estado", estado);
    if (categoria) params.set("categoria", categoria);
    if (autor) params.set("autor", autor);
    if (n > 1) params.set("pagina", String(n));
    const qs = params.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };
  const filtered = Boolean(query || estado || categoria || autor);

  return (
    <div className="px-5 md:px-10 py-9">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-[28px]">{manager ? "Entradas" : "Mis entradas"}</h1>
          <p className="mt-1 text-[15px] text-neutral-600">
            Hola{firstName ? `, ${firstName}` : ""}. {manager ? "Aquí están todos los textos de la comunidad." : "Aquí están los textos que has escrito."}
          </p>
        </div>
        <Link href="/admin/entradas/nueva" className="bg-ink text-white rounded-full px-5 py-2.5 text-[15px] font-medium">
          + Nueva entrada
        </Link>
      </div>

      <div className={`mt-5 grid grid-cols-1 gap-4 ${manager ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        <div className="bg-white rounded-[10px] px-5 py-4">
          <div className="text-[15px] text-neutral-600">Publicadas</div>
          <div className="font-bold text-[30px] mt-0.5">{publishedCount}</div>
        </div>
        <div className="bg-white rounded-[10px] px-5 py-4">
          <div className="text-[15px] text-neutral-600">Borradores</div>
          <div className="font-bold text-[30px] mt-0.5">{draftCount}</div>
        </div>
        {manager && (
          <Link href="/admin/suscriptores" className="bg-lilac rounded-[10px] px-5 py-4 hover:brightness-95">
            <div className="text-[15px] text-slate">Suscriptores</div>
            <div className="font-bold text-[30px] mt-0.5">{subscriberCount}</div>
          </Link>
        )}
      </div>

      <div className="mt-5 bg-white rounded-[10px] py-1.5">
        <Suspense>
          <PostsFilters
            categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
            authors={authors.map((u) => ({ value: u.id, label: u.name }))}
          />
        </Suspense>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[60px_1fr_190px_110px_120px_90px] gap-4 px-5 py-2 text-xs font-bold tracking-[0.08em] uppercase text-neutral-600 border-b border-neutral-100">
              <span />
              <span>Título</span>
              <span>Categoría</span>
              <span>Estado</span>
              <span>Fecha</span>
              <span />
            </div>

            {posts.length === 0 && (
              <div className="px-5 py-10 text-center text-neutral-600">
                {filtered ? "No hay entradas con esos filtros." : "Aún no hay entradas. Crea la primera con “Nueva entrada”."}
              </div>
            )}

            {posts.map((post) => (
              <div
                key={post.id}
                className="grid grid-cols-[60px_1fr_190px_110px_120px_90px] gap-4 items-center px-5 py-3 border-b border-neutral-100 last:border-0"
              >
                <div className="w-[60px] h-12 rounded bg-mist overflow-hidden">
                  {post.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{post.title}</div>
                  <div className="text-[13px] text-neutral-600">{post.writer.name}</div>
                </div>
                <span className="text-[15px]">{post.category.name}</span>
                <span
                  className={`justify-self-start text-xs font-bold px-2 py-0.5 rounded-full ${
                    post.status === "PUBLISHED" ? "bg-[#e3efe3] text-[#1f5c2a]" : "bg-lilac text-slate"
                  }`}
                >
                  {post.status === "PUBLISHED" ? "Publicada" : "Borrador"}
                </span>
                <span className="text-[15px] text-neutral-600">
                  {(post.publishedAt ?? post.updatedAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <Link href={`/admin/entradas/${post.id}`} target="_blank" className="border border-ink rounded-full px-3 py-1.5 text-[13px] text-center hover:bg-ink hover:text-white">
                  Editar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pageCount > 1 && (
        <nav aria-label="Páginas" className="mt-5 flex justify-center items-center flex-wrap gap-1 text-[14px]">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="h-9 px-3 flex items-center rounded-full hover:bg-white">
              ‹ Anterior
            </Link>
          )}
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={pageHref(n)}
              aria-current={n === page ? "page" : undefined}
              className={`w-9 h-9 flex items-center justify-center rounded-full ${n === page ? "bg-ink text-white" : "hover:bg-white"}`}
            >
              {n}
            </Link>
          ))}
          {page < pageCount && (
            <Link href={pageHref(page + 1)} className="h-9 px-3 flex items-center rounded-full hover:bg-white">
              Siguiente ›
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
