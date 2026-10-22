"use client";

import { useEffect, useState } from "react";

/**
 * "Google" box of the post editor: optional title and description for search results, with a live
 * preview of how the post shows in Google. Empty fields fall back to the post title and the extract.
 */
export function SeoFields({ slug, seoTitle, seoDescription }: { slug?: string; seoTitle: string; seoDescription: string }) {
  const [title, setTitle] = useState(seoTitle);
  const [description, setDescription] = useState(seoDescription);
  const [postTitle, setPostTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");

  useEffect(() => {
    // Follow the post's title and extract so the preview shows the fallback text.
    const titleInput = document.getElementById("post-title") as HTMLInputElement | null;
    const excerptInput = document.getElementById("post-excerpt") as HTMLTextAreaElement | null;
    const sync = () => {
      setPostTitle(titleInput?.value ?? "");
      setExcerpt(excerptInput?.value ?? "");
    };
    sync();
    titleInput?.addEventListener("input", sync);
    excerptInput?.addEventListener("input", sync);
    return () => {
      titleInput?.removeEventListener("input", sync);
      excerptInput?.removeEventListener("input", sync);
    };
  }, []);

  const shownTitle = `${title.trim() || postTitle.trim() || "Título de la entrada"} | Nostalgia del Paraíso`;
  const shownDescription = description.trim() || excerpt.trim() || "Google usará el inicio del texto de la entrada.";
  const counter = (n: number, max: number) => (
    <span className={`text-[12px] ${n > max ? "text-red-700 font-bold" : "text-neutral-500"}`}>
      {n}/{max}
    </span>
  );

  return (
    <div className="bg-white rounded-[10px] p-4 flex flex-col gap-3">
      <div>
        <div className="font-bold">Google (SEO)</div>
        <p className="text-[13px] text-neutral-600 mt-0.5">Opcional. Si lo dejas vacío se usan el título y el extracto.</p>
      </div>

      <div className="rounded-lg border border-mist p-3 flex flex-col gap-0.5" aria-label="Vista previa en Google">
        <span className="text-[12px] text-neutral-600 truncate">nostalgiadelparaiso.com › blog › {slug || "…"}</span>
        <span className="text-[17px] leading-snug text-[#1a0dab] line-clamp-2">{shownTitle}</span>
        <span className="text-[13px] leading-snug text-neutral-700 line-clamp-3">{shownDescription}</span>
      </div>

      <label className="flex flex-col gap-1">
        <span className="flex justify-between text-[13px] font-bold text-neutral-600">
          Título para Google {counter(title.length, 60)}
        </span>
        <input name="seoTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={postTitle || "Igual que el título"} className="h-10 border border-mist rounded-lg px-3 text-[14px]" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="flex justify-between text-[13px] font-bold text-neutral-600">
          Descripción para Google {counter(description.length, 160)}
        </span>
        <textarea
          name="seoDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="De qué trata la entrada, en una o dos frases. Incluye palabras que la gente buscaría."
          className="border border-mist rounded-lg px-3 py-2 text-[14px] resize-none"
        />
      </label>
    </div>
  );
}
