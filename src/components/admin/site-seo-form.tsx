"use client";

import { useActionState, useState } from "react";
import { saveSiteSeo, type SeoFormState } from "@/app/actions/site-seo";

type Values = Record<string, string>;

const SITE_NAME = "Nostalgia del Paraíso";

function Counter({ n, max }: { n: number; max: number }) {
  return <span className={`text-[12px] ${n > max ? "text-red-700 font-bold" : "text-neutral-500"}`}>{n}/{max}</span>;
}

/** Google result preview: the title in blue, the address and the description. */
function Preview({ path, title, description }: { path: string; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-mist bg-white p-3 flex flex-col gap-0.5" aria-label="Vista previa en Google">
      <span className="text-[12px] text-neutral-600">nostalgiadelparaiso.com{path}</span>
      <span className="text-[18px] leading-snug text-[#1a0dab] line-clamp-1">{title}</span>
      <span className="text-[13px] leading-snug text-neutral-700 line-clamp-2">{description}</span>
    </div>
  );
}

export function SiteSeoForm({ saved, defaults }: { saved: Values; defaults: Values }) {
  const [state, action, pending] = useActionState<SeoFormState, FormData>(saveSiteSeo, {});
  const [values, setValues] = useState<Values>(saved);
  const val = (k: string) => values[k] ?? "";
  const shown = (k: string, fallback = defaults[k]) => val(k).trim() || fallback;
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const field = (k: string, label: string, max: number, multiline = false, placeholder = defaults[k]) => (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between text-[13px] font-bold text-neutral-600">
        {label} {max > 0 && <Counter n={val(k).length} max={max} />}
      </span>
      {multiline ? (
        <textarea name={k} value={val(k)} onChange={set(k)} rows={3} placeholder={placeholder} className="border border-mist rounded-lg px-3 py-2 text-[14px] resize-none placeholder:text-neutral-400" />
      ) : (
        <input name={k} value={val(k)} onChange={set(k)} placeholder={placeholder} className="h-10 border border-mist rounded-lg px-3 text-[14px] placeholder:text-neutral-400" />
      )}
    </label>
  );

  const siteTitle = shown("title");
  const siteDescription = shown("description");
  const pageTitle = (k: string) => `${shown(k)} | ${SITE_NAME}`;

  return (
    <form action={action} className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <section className="bg-white rounded-[10px] p-5 flex flex-col gap-3 xl:col-span-2">
        <h2 className="font-bold text-[18px]">Todo el sitio</h2>
        <p className="text-[14px] text-neutral-600 -mt-2">Nombre y descripción generales; también se usan en la página de inicio y al compartir en redes.</p>
        <Preview path="" title={shown("homeTitle", siteTitle)} description={shown("homeDescription", siteDescription)} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            {field("title", "Título del sitio", 60)}
            {field("description", "Descripción del sitio", 160, true)}
          </div>
          <div className="flex flex-col gap-3">
            {field("keywords", "Palabras clave (separadas por comas)", 0, true)}
            <p className="text-[13px] text-neutral-500">Google casi no usa las palabras clave; lo que más cuenta es que el título y la descripción digan lo que la gente busca (por ejemplo “Ángeles Nava”, “taller de poesía”).</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-[10px] p-5 flex flex-col gap-3">
        <h2 className="font-bold text-[18px]">Inicio</h2>
        {field("homeTitle", "Título", 60, false, siteTitle)}
        {field("homeDescription", "Descripción", 160, true, siteDescription)}
      </section>

      <section className="bg-white rounded-[10px] p-5 flex flex-col gap-3">
        <h2 className="font-bold text-[18px]">Entradas (blog)</h2>
        <Preview path=" › blog" title={pageTitle("blogTitle")} description={shown("blogDescription")} />
        {field("blogTitle", "Título", 45)}
        {field("blogDescription", "Descripción", 160, true)}
      </section>

      <section className="bg-white rounded-[10px] p-5 flex flex-col gap-3">
        <h2 className="font-bold text-[18px]">Acerca de</h2>
        <Preview path=" › acerca-de-nosotros" title={pageTitle("aboutTitle")} description={shown("aboutDescription")} />
        {field("aboutTitle", "Título", 45)}
        {field("aboutDescription", "Descripción", 160, true)}
      </section>

      <div className="xl:col-span-2 flex items-center gap-4">
        <button type="submit" disabled={pending} className="bg-ink text-white rounded-full px-7 py-3 font-medium disabled:opacity-60">
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        {state.ok && !pending && <span role="status" className="text-[14px] text-green-800">Guardado. Google verá los cambios la próxima vez que visite el sitio.</span>}
        {state.error && <span role="alert" className="text-[14px] text-red-800">{state.error}</span>}
      </div>
    </form>
  );
}
