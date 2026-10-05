import Link from "next/link";
import type { Category, Post } from "@prisma/client";
import { ImageUploadField } from "./image-upload-field";
import { RichTextEditor } from "./rich-text-editor";
import { DeletePostButton } from "./delete-post-button";

export function PostForm({
  post,
  categories,
  action,
  deleteAction,
  heading,
  submitLabel,
}: {
  post?: Post;
  categories: Category[];
  action: (formData: FormData) => void;
  deleteAction?: () => Promise<void>;
  heading: string;
  submitLabel: string;
}) {
  return (
    <form action={action} className="min-h-screen flex flex-col">
      <div className="min-h-[68px] bg-white border-b border-mist flex flex-wrap items-center gap-x-4 gap-y-2 px-6 md:px-8 py-3">
        <Link href="/admin" className="flex items-center gap-2 text-[15px]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          Entradas
        </Link>
        <span className="text-neutral-400">/</span>
        <span className="text-[15px] text-neutral-600 truncate max-w-[360px]">{heading}</span>
        <div className="ml-auto flex items-center gap-3">
          {post?.status === "PUBLISHED" && (
            <Link href={`/blog/${post.slug}`} target="_blank" className="border border-ink rounded-full px-[18px] py-2.5 text-sm">
              Ver en el sitio
            </Link>
          )}
          <button type="submit" className="bg-ink text-white rounded-full px-[22px] py-[11px] text-sm font-medium">
            {submitLabel}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-7 p-6 md:p-8">
        <div className="bg-white rounded-[10px] px-6 md:px-16 py-10">
          <label htmlFor="post-title" className="sr-only">Título</label>
          <input
            id="post-title"
            name="title"
            required
            defaultValue={post?.title}
            placeholder="Título de la entrada"
            className="w-full font-serif font-semibold text-[34px] md:text-5xl outline-none placeholder:text-neutral-300"
          />
          <label htmlFor="post-excerpt" className="block mt-[18px] text-[13px] font-bold text-neutral-600">
            Extracto (se muestra en las tarjetas)
          </label>
          <textarea
            id="post-excerpt"
            name="excerpt"
            defaultValue={post?.excerpt ?? ""}
            rows={2}
            className="mt-1.5 w-full border border-mist rounded-lg px-3 py-2.5 text-[15px] resize-none"
          />
          <div className="mt-6">
            <RichTextEditor name="content" defaultValue={post?.content} />
          </div>
        </div>

        <aside className="flex flex-col gap-[18px]">
          <fieldset className="bg-white rounded-[10px] p-5">
            <legend className="sr-only">Estado</legend>
            <div className="text-[15px] font-bold mb-3">Estado</div>
            <div className="flex bg-panel rounded-full p-1 text-sm">
              <label className="flex-1 text-center rounded-full py-2.5 cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white">
                <input type="radio" name="status" value="DRAFT" defaultChecked={post ? post.status === "DRAFT" : false} className="sr-only" />
                Borrador
              </label>
              <label className="flex-1 text-center rounded-full py-2.5 cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white">
                <input type="radio" name="status" value="PUBLISHED" defaultChecked={post ? post.status === "PUBLISHED" : true} className="sr-only" />
                Publicada
              </label>
            </div>
          </fieldset>

          <div className="bg-white rounded-[10px] p-5 flex flex-col gap-2">
            <label htmlFor="post-category" className="text-[15px] font-bold">Categoría</label>
            <select
              id="post-category"
              name="categoryId"
              required
              defaultValue={post?.categoryId ?? ""}
              className="h-11 border border-mist rounded-lg px-3 text-[15px] bg-white"
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-[10px] p-5">
            <ImageUploadField name="coverImage" label="Imagen destacada" defaultValue={post?.coverImage ?? ""} />
          </div>

          <div className="bg-lilac rounded-[10px] px-5 py-[18px] text-sm leading-relaxed text-[#2a2b40]">
            <strong>Consejo:</strong> las fotos se comprimen solas al subirlas. Puedes subirlas directo del celular.
          </div>

          {deleteAction && <DeletePostButton action={deleteAction} />}
        </aside>
      </div>
    </form>
  );
}
