"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Category, Post } from "@prisma/client";
import type { PostFormState } from "@/app/admin/(dashboard)/entradas/actions";
import { ImageUploadField } from "./image-upload-field";
import { RichTextEditor } from "./rich-text-editor";
import { DeletePostButton } from "./delete-post-button";

type AuthorOption = { id: string; name: string };

export function PostForm({
  post,
  categories,
  authors,
  currentUserId,
  action,
  deleteAction,
  heading,
  submitLabel,
}: {
  post?: Post;
  categories: Category[];
  /** Only passed to managers, who may publish on behalf of another writer. */
  authors?: AuthorOption[];
  currentUserId: string;
  action: (prev: PostFormState, formData: FormData) => Promise<PostFormState>;
  deleteAction?: () => Promise<void>;
  heading: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const justCreated = useSearchParams().get("guardada") === "1";
  const [hiddenSavedAt, setHiddenSavedAt] = useState<number | undefined>(undefined);
  const [createdNoticeHidden, setCreatedNoticeHidden] = useState(false);

  // Each save gets its own timestamp; the notice hides itself a few seconds later.
  useEffect(() => {
    if (!state.savedAt) return;
    const t = setTimeout(() => setHiddenSavedAt(state.savedAt), 3500);
    return () => clearTimeout(t);
  }, [state.savedAt]);

  useEffect(() => {
    if (!justCreated) return;
    const t = setTimeout(() => setCreatedNoticeHidden(true), 3500);
    return () => clearTimeout(t);
  }, [justCreated]);

  const toast =
    state.savedAt && state.savedAt !== hiddenSavedAt
      ? "Cambios guardados"
      : justCreated && !createdNoticeHidden && !state.savedAt
        ? "Entrada guardada"
        : null;

  return (
    <form action={formAction} className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-20 min-h-[60px] bg-white border-b border-mist flex flex-wrap items-center gap-x-3 gap-y-2 px-5 md:px-7 py-2.5 text-[15px]">
        <Link href="/admin" className="flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          Entradas
        </Link>
        <span className="text-neutral-400">/</span>
        <span className="text-neutral-600 truncate max-w-[320px]">{heading}</span>
        <div className="ml-auto flex items-center gap-2.5">
          {toast && (
            <span role="status" className="flex items-center gap-1.5 bg-[#e3efe3] text-[#1f5c2a] rounded-full px-3 py-1.5 text-[15px] font-medium">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M5 12l5 5L20 7" />
              </svg>
              {toast}
            </span>
          )}
          {post?.status === "PUBLISHED" && (
            <Link href={`/blog/${post.slug}`} target="_blank" className="border border-ink rounded-full px-4 py-2 text-[15px]">
              Ver en el sitio
            </Link>
          )}
          <button type="submit" disabled={pending} className="bg-ink text-white rounded-full px-5 py-2 text-[15px] font-medium disabled:opacity-60">
            {pending ? "Guardando..." : submitLabel}
          </button>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="mx-5 md:mx-7 mt-4 bg-red-50 text-red-800 rounded-lg px-4 py-3 text-[15px]">
          {state.error}
        </p>
      )}

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 p-5 md:p-7">
        <div className="bg-white rounded-[10px] px-5 md:px-10 py-8">
          <label htmlFor="post-title" className="sr-only">Título</label>
          <input
            id="post-title"
            name="title"
            required
            defaultValue={post?.title}
            placeholder="Título de la entrada"
            className="w-full font-bold text-[28px] md:text-[32px] outline-none placeholder:text-neutral-300"
          />
          <label htmlFor="post-excerpt" className="block mt-4 text-[13px] font-bold text-neutral-600">
            Extracto (se muestra en las tarjetas)
          </label>
          <textarea
            id="post-excerpt"
            name="excerpt"
            defaultValue={post?.excerpt ?? ""}
            rows={2}
            className="mt-1.5 w-full border border-mist rounded-lg px-3 py-2 text-[15px] resize-none"
          />
          <div className="mt-5">
            <RichTextEditor name="content" defaultValue={post?.content} />
          </div>
        </div>

        <aside className="flex flex-col gap-4 text-[15px]">
          <fieldset className="bg-white rounded-[10px] p-4">
            <legend className="sr-only">Estado</legend>
            <div className="font-bold mb-2.5">Estado</div>
            <div className="flex bg-panel rounded-full p-1 text-[15px]">
              <label className="flex-1 text-center rounded-full py-2 cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white">
                <input type="radio" name="status" value="DRAFT" defaultChecked={post ? post.status === "DRAFT" : false} className="sr-only" />
                Borrador
              </label>
              <label className="flex-1 text-center rounded-full py-2 cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white">
                <input type="radio" name="status" value="PUBLISHED" defaultChecked={post ? post.status === "PUBLISHED" : true} className="sr-only" />
                Publicada
              </label>
            </div>
          </fieldset>

          <div className="bg-white rounded-[10px] p-4 flex flex-col gap-1.5">
            <label htmlFor="post-category" className="font-bold">Categoría</label>
            <select id="post-category" name="categoryId" required defaultValue={post?.categoryId ?? ""} className="h-11 border border-mist rounded-lg px-2.5 bg-white">
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

          {authors && (
            <div className="bg-white rounded-[10px] p-4 flex flex-col gap-1.5">
              <label htmlFor="post-author" className="font-bold">Publicada por</label>
              <select id="post-author" name="authorId" defaultValue={post?.authorId ?? currentUserId} className="h-11 border border-mist rounded-lg px-2.5 bg-white">
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <span className="text-[13px] text-neutral-600">Para agregar a alguien, regístrala en Usuarios.</span>
            </div>
          )}

          <div className="bg-white rounded-[10px] p-4">
            <ImageUploadField name="coverImage" label="Imagen destacada" defaultValue={post?.coverImage ?? ""} />
          </div>

          <div className="bg-lilac rounded-[10px] px-4 py-3.5 text-[15px] leading-relaxed text-[#2a2b40]">
            <strong>Consejo:</strong> con el botón “Imagen” de la barra puedes poner fotos dentro del texto, a la izquierda, al centro o a la derecha.
          </div>

          {deleteAction && <DeletePostButton action={deleteAction} />}
        </aside>
      </div>
    </form>
  );
}
