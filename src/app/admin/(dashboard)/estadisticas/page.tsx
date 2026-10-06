import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireManagerPage } from "@/lib/permissions";
import { SOURCES, SOURCE_LABELS, type Source } from "@/lib/traffic";
import { SessionsChart } from "@/components/admin/sessions-chart";

export const dynamic = "force-dynamic";

const TZ = "America/Mexico_City";
const RANGES = [7, 30, 90];

/** "n days ago" from the time of the request. */
function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000);
}

function dayKey(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: TZ });
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  await requireManagerPage();
  const { dias } = await searchParams;
  const range = RANGES.includes(Number(dias)) ? Number(dias) : 30;
  const since = daysAgo(range);

  const [daily, sources, totals, topPosts] = await Promise.all([
    prisma.$queryRaw<{ day: string; sessions: bigint }[]>`
      SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${TZ}, 'YYYY-MM-DD') AS day, COUNT(DISTINCT "sessionId") AS sessions
      FROM "PageView" WHERE "createdAt" >= ${since} GROUP BY day`,
    prisma.$queryRaw<{ source: string; sessions: bigint }[]>`
      SELECT "source", COUNT(DISTINCT "sessionId") AS sessions FROM "PageView" WHERE "createdAt" >= ${since} GROUP BY "source"`,
    prisma.$queryRaw<{ sessions: bigint; visitors: bigint; views: bigint }[]>`
      SELECT COUNT(DISTINCT "sessionId") AS sessions, COUNT(DISTINCT "visitorId") AS visitors, COUNT(*) AS views
      FROM "PageView" WHERE "createdAt" >= ${since}`,
    prisma.pageView.groupBy({
      by: ["postId"],
      where: { createdAt: { gte: since }, postId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { postId: "desc" } },
      take: 10,
    }),
  ]);

  const perDay = new Map(daily.map((d) => [d.day, Number(d.sessions)]));
  const days = Array.from({ length: range }, (_, i) => {
    const date = daysAgo(range - 1 - i);
    return {
      date: dayKey(date),
      label: date.toLocaleDateString("es-MX", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }),
      short: date.toLocaleDateString("es-MX", { timeZone: TZ, day: "numeric", month: "short" }),
      sessions: perDay.get(dayKey(date)) ?? 0,
    };
  });

  const bySource = new Map<Source, number>();
  for (const s of sources) {
    const key = (SOURCES as readonly string[]).includes(s.source) ? (s.source as Source) : "otros";
    bySource.set(key, (bySource.get(key) ?? 0) + Number(s.sessions));
  }
  const sourceRows = SOURCES.map((s) => ({ key: s, label: SOURCE_LABELS[s], sessions: bySource.get(s) ?? 0 }));
  const sourceTotal = Math.max(1, sourceRows.reduce((sum, r) => sum + r.sessions, 0));
  const sourceMax = Math.max(1, ...sourceRows.map((r) => r.sessions));

  const posts = await prisma.post.findMany({
    where: { id: { in: topPosts.map((p) => p.postId!) } },
    select: { id: true, title: true, slug: true, likes: true, _count: { select: { comments: true } } },
  });
  const postRows = topPosts
    .map((t) => ({ views: t._count._all, post: posts.find((p) => p.id === t.postId) }))
    .filter((r) => r.post);

  const total = totals[0] ?? { sessions: 0, visitors: 0, views: 0 };
  const tiles = [
    { label: "Sesiones", value: Number(total.sessions) },
    { label: "Visitantes", value: Number(total.visitors) },
    { label: "Páginas vistas", value: Number(total.views) },
  ];

  return (
    <div className="px-5 md:px-10 py-9 flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-bold text-[28px]">Estadísticas</h1>
          <p className="mt-1 text-[15px] text-neutral-600">Visitas al sitio público (sin contar el panel).</p>
        </div>
        <nav className="flex bg-white rounded-full p-1 text-[14px]" aria-label="Periodo">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/estadisticas?dias=${r}`}
              aria-current={r === range ? "page" : undefined}
              className={`px-3.5 py-1.5 rounded-full ${r === range ? "bg-ink text-white" : "hover:bg-panel"}`}
            >
              {r} días
            </Link>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="bg-white rounded-[10px] px-4 py-3.5">
            <div className="text-[13px] text-neutral-600">{t.label}</div>
            <div className="mt-1 font-bold text-[26px] leading-none">{t.value.toLocaleString("es-MX")}</div>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-[10px] p-5">
        <h2 className="font-bold text-[17px]">Sesiones del sitio a lo largo del tiempo</h2>
        <div className="mt-3">
          <SessionsChart days={days} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <section className="bg-white rounded-[10px] p-5">
          <h2 className="font-bold text-[17px]">Principales fuentes de tráfico</h2>
          <p className="text-[13px] text-neutral-600">Sesiones según de dónde llegaron.</p>
          <ul className="mt-4 flex flex-col gap-3">
            {sourceRows.map((r) => (
              <li key={r.key} className="text-[14px]">
                <div className="flex justify-between gap-3">
                  <span>{r.label}</span>
                  <span className="text-neutral-700 tabular-nums">
                    <strong className="text-ink">{r.sessions}</strong> · {Math.round((r.sessions / sourceTotal) * 100)}%
                  </span>
                </div>
                <div className="mt-1 h-2.5 bg-panel rounded-full overflow-hidden">
                  <div className="h-full bg-slate rounded-full" style={{ width: `${(r.sessions / sourceMax) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-[10px] p-5">
          <h2 className="font-bold text-[17px]">Rendimiento del blog</h2>
          <p className="text-[13px] text-neutral-600">Entradas más vistas en el periodo.</p>
          {postRows.length === 0 ? (
            <p className="mt-4 text-[14px] text-neutral-600">Aún no hay visitas a entradas en este periodo.</p>
          ) : (
            <table className="mt-3 w-full text-[14px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-[0.06em] text-neutral-500">
                  <th className="py-2 font-semibold">Entrada</th>
                  <th className="py-2 font-semibold text-right">Vistas</th>
                  <th className="py-2 font-semibold text-right hidden sm:table-cell">Comentarios</th>
                  <th className="py-2 font-semibold text-right hidden sm:table-cell">Me gusta</th>
                </tr>
              </thead>
              <tbody>
                {postRows.map(({ post, views }) => (
                  <tr key={post!.id} className="border-t border-neutral-100">
                    <td className="py-2 pr-3">
                      <Link href={`/blog/${post!.slug}`} target="_blank" className="hover:underline line-clamp-2">
                        {post!.title}
                      </Link>
                    </td>
                    <td className="py-2 text-right tabular-nums font-semibold">{views}</td>
                    <td className="py-2 text-right tabular-nums hidden sm:table-cell">{post!._count.comments}</td>
                    <td className="py-2 text-right tabular-nums hidden sm:table-cell">{post!.likes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
