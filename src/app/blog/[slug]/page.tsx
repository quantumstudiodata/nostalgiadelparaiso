import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true, author: true },
  });

  if (!post) notFound();

  return (
    <>
      <SiteHeader />

      <article className="max-w-2xl mx-auto px-6 py-14">
        <Link href={`/blog?categoria=${post.category.slug}`} className="text-xs text-accent">
          {post.category.name}
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl mt-3 mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="text-xs text-neutral-500 mb-8">
          {post.author.name} ·{" "}
          {post.publishedAt?.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>

        {post.coverImage && (
          <div className="aspect-video bg-neutral-100 overflow-hidden mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="text-[15px] leading-relaxed text-neutral-800 whitespace-pre-line">
          {post.content}
        </div>
      </article>

      <SiteFooter />
    </>
  );
}
