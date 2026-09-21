import { prisma } from "@/lib/prisma";
import { updateSiteBlock } from "./actions";

const FIELD_LABELS: Record<string, { label: string; multiline?: boolean }> = {
  title: { label: "Título principal" },
  buttonText: { label: "Texto del botón" },
  body: { label: "Párrafo de bienvenida", multiline: true },
  bio: { label: "Biografía", multiline: true },
  name: { label: "Nombre" },
  imageUrl: { label: "Foto de portada (URL)" },
  avatarUrl: { label: "Foto (URL)" },
};

export default async function SiteTextsPage() {
  const blocks = await prisma.siteBlock.findMany({
    where: { page: { in: ["home", "blog"] } },
    orderBy: { id: "asc" },
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="h-[72px] shrink-0 border-b border-neutral-200 flex items-center justify-between px-8">
        <div>
          <h1 className="font-serif text-[20px]">Textos del sitio — Página de Inicio</h1>
          <div className="text-xs text-neutral-500 mt-0.5">
            Edita el contenido de los bloques fijos de la página
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-4 max-w-3xl">
        {blocks.map((block) => {
          const fields = block.fields as Record<string, string>;
          const boundUpdate = updateSiteBlock.bind(null, block.id);

          return (
            <form
              key={block.id}
              action={boundUpdate}
              className="bg-white border border-neutral-200 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold">{block.label}</div>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#a35a3a] bg-[#f7e9df] px-2.5 py-1 rounded-full">
                  Estructura bloqueada
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {Object.entries(fields).map(([key, value]) => {
                  const meta = FIELD_LABELS[key] ?? { label: key };
                  return (
                    <div key={key}>
                      <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
                        {meta.label}
                      </label>
                      {meta.multiline ? (
                        <textarea
                          name={key}
                          defaultValue={value}
                          rows={3}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm"
                        />
                      ) : (
                        <input
                          name={key}
                          defaultValue={value}
                          className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <button className="mt-4 bg-accent text-white text-sm px-5 py-2.5 rounded-lg">
                Guardar cambios
              </button>
            </form>
          );
        })}

        <div className="bg-neutral-100 rounded-xl p-4 text-xs text-neutral-600 leading-relaxed">
          Solo puedes cambiar los textos e imágenes dentro de cada bloque. El
          orden de las secciones, colores y tipografía del sitio están
          protegidos y solo tu agencia puede modificarlos.
        </div>
      </div>
    </div>
  );
}
