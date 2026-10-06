"use client";

import Link from "next/link";
import { useState } from "react";
import { PostCard } from "@/components/site/post-card";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: { id: string; name: string };
  writer: { id: string; name: string; avatarUrl: string | null };
};

const SHOWN = 6;

/** Category chips that filter the recent posts in place, without reloading the page. */
export function RecentPosts({
  posts,
  categories,
  total,
}: {
  posts: Post[];
  categories: { id: string; name: string; slug: string; count: number }[];
  total: number;
}) {
  const [active, setActive] = useState<string | null>(null);
  const visible = (active ? posts.filter((p) => p.category.id === active) : posts).slice(0, SHOWN);
  const activeCategory = categories.find((c) => c.id === active);
  const chip = (on: boolean) =>
    `rounded-full px-3.5 lg:px-5 py-[7px] lg:py-[9px] border border-ink transition-colors ${on ? "bg-ink text-white" : "hover:bg-ink hover:text-white"}`;

  return (
    <>
      <div className="mt-[18px] lg:mt-6 flex flex-wrap gap-2 lg:gap-3 text-sm lg:text-[15px]" role="group" aria-label="Filtrar por categoría">
        <button type="button" aria-pressed={!active} onClick={() => setActive(null)} className={chip(!active)}>
          Todos ({total})
        </button>
        {categories.map((c) => (
          <button key={c.id} type="button" aria-pressed={active === c.id} onClick={() => setActive(c.id)} className={chip(active === c.id)}>
            {c.name} ({c.count})
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="mt-10 text-neutral-600">Aún no hay entradas publicadas{activeCategory ? " en esta categoría" : ""}.</p>
      ) : (
        <div className="mt-9 lg:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12 lg:gap-y-16">
          {visible.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <div className="mt-10">
        <Link
          href={activeCategory ? `/blog?categoria=${activeCategory.slug}` : "/blog"}
          className="inline-block border-[1.5px] border-ink rounded-full px-7 py-3 text-[15px] font-medium hover:bg-ink hover:text-white"
        >
          {activeCategory ? `Ver todas las entradas de ${activeCategory.name}` : "Ver todas las entradas"}
        </Link>
      </div>
    </>
  );
}
