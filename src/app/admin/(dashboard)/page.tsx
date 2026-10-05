import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isManager } from "@/lib/permissions";

const FILTERS = [
  { value: undefined, label: "Todas" },
  { value: "publicadas", label: "Publicadas" },
  { value: "borradores", label: "Borradores" },
] as const;

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const { q, estado } = await searchParams;
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  const manager = isManager(session?.user?.role);
  // Authors only manage their own posts.
  const own: Prisma.PostWhereInput = manager ? {} : { authorId: session?.user?.id ?? "" };

  const query = q?.trim();
  const where: Prisma.PostWhereInput = {
    ...own,
    ...(estado === "publicadas" ? { status: "PUBLISHED" } : {}),
    ...(estado === "borradores" ? { status: "DRAFT" } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { author: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [posts, publishedCount, draftCount, subscriberCount] = await Promise.all([
    prisma.post.findMany({
      where,
      include: { category: true, author: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.post.count({ where: { ...own, status: "PUBLISHED" } }),
    prisma.post.count({ where: { ...own, status: "DRAFT" } }),
    manager ? prisma.subscriber.count() : Promise.resolve(0),
  ]);

  const filterHref = (value?: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (value) params.set("estado", value);
    const qs = params.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  return (
    <div className="px-5 md:px-8 py-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl">{manager ? "Entradas" : "Mis entradas"}</h1>
          <p className="mt-1 text-[13px] text-neutral-600">
            Hola{firstName ? `, ${firstName}` : ""}. {manager ? "Aquí están todos los textos de la comunidad." : "Aquí están los textos que has escrito."}
          </p>
        </div>
        <Link href="/admin/entradas/nueva" className="bg-ink text-white rounded-full px-5 py-2.5 text-[13px] font-medium">
          + Nueva entrada
        </Link>
      </div>

      <div className={`mt-5 grid grid-cols-1 gap-4 ${manager ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        <div className="bg-white rounded-[10px] px-5 py-4">
          <div className="text-[13px] text-neutral-600">Publicadas</div>
          <div className="font-bold text-[26px] mt-0.5">{publishedCount}</div>
        </div>
        <div className="bg-white rounded-[10px] px-5 py-4">
          <div className="text-[13px] text-neutral-600">Borradores</div>
          <div className="font-bold text-[26px] mt-0.5">{draftCount}</div>
        </div>
        {manager && (
          <Link href="/admin/suscriptores" className="bg-lilac rounded-[10px] px-5 py-4 hover:brightness-95">
            <div className="text-[13px] text-slate">Suscriptores</div>
            <div className="font-bold text-[26px] mt-0.5">{subscriberCount}</div>
          </Link>
        )}
      </div>

      <div className="mt-5 bg-white rounded-[10px] py-1.5">
        <div className="flex flex-wrap gap-3 items-center px-5 py-3">
          <form action="/admin" className="flex-1 min-w-[240px]">
            {estado && <input type="hidden" name="estado" value={estado} />}
            <label htmlFor="admin-q" className="sr-only">Buscar entradas</label>
            <div className="flex items-center gap-2.5 h-10 border border-mist rounded-full px-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                <circle cx="10.5" cy="10.5" r="7" />
                <path d="M21 21l-5.5-5.5" />
              </svg>
              <input
                id="admin-q"
                name="q"
                defaultValue={query}
                placeholder="Buscar por título o autor"
                className="flex-1 min-w-0 text-[13px] outline-none bg-transparent"
              />
            </div>
          </form>
          {FILTERS.map((f) => {
            const active = (estado ?? undefined) === f.value;
            return (
              <Link
                key={f.label}
                href={filterHref(f.value)}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3.5 py-2 text-[13px] ${active ? "bg-ink text-white" : "border border-ink hover:bg-ink hover:text-white"}`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[52px_1fr_170px_100px_110px_80px] gap-4 px-5 py-2 text-[11px] font-bold tracking-[0.08em] uppercase text-neutral-600 border-b border-neutral-100">
              <span />
              <span>Título</span>
              <span>Categoría</span>
              <span>Estado</span>
              <span>Fecha</span>
              <span />
            </div>

            {posts.length === 0 && (
              <div className="px-5 py-10 text-center text-neutral-600">
                {query || estado ? "No hay entradas con esos filtros." : "Aún no hay entradas. Crea la primera con “Nueva entrada”."}
              </div>
            )}

            {posts.map((post) => (
              <div
                key={post.id}
                className="grid grid-cols-[52px_1fr_170px_100px_110px_80px] gap-4 items-center px-5 py-3 border-b border-neutral-100 last:border-0"
              >
                <div className="w-[52px] h-10 rounded bg-mist overflow-hidden">
                  {post.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{post.title}</div>
                  <div className="text-xs text-neutral-600">{post.author.name}</div>
                </div>
                <span className="text-[13px]">{post.category.name}</span>
                <span
                  className={`justify-self-start text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    post.status === "PUBLISHED" ? "bg-[#e3efe3] text-[#1f5c2a]" : "bg-lilac text-slate"
                  }`}
                >
                  {post.status === "PUBLISHED" ? "Publicada" : "Borrador"}
                </span>
                <span className="text-[13px] text-neutral-600">
                  {(post.publishedAt ?? post.updatedAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <Link href={`/admin/entradas/${post.id}`} className="border border-ink rounded-full px-3 py-1.5 text-xs text-center hover:bg-ink hover:text-white">
                  Editar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
