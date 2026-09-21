import type { Category, Post } from "@prisma/client";

export function PostForm({
  post,
  categories,
  action,
  submitLabel,
}: {
  post?: Post;
  categories: Category[];
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex-1 overflow-y-auto flex gap-6 p-8">
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        <div>
          <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
            Título de la entrada
          </label>
          <input
            name="title"
            required
            defaultValue={post?.title}
            className="w-full border border-neutral-300 rounded-lg px-3.5 py-3 font-serif text-xl"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
            Imagen destacada (URL)
          </label>
          <input
            name="coverImage"
            defaultValue={post?.coverImage ?? ""}
            placeholder="https://..."
            className="w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
            Contenido
          </label>
          <textarea
            name="content"
            required
            defaultValue={post?.content}
            rows={14}
            className="w-full border border-neutral-300 rounded-lg px-3.5 py-3 text-sm leading-relaxed"
          />
        </div>
      </div>

      <div className="w-[300px] shrink-0 flex flex-col gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
            Categoría
          </label>
          <select
            name="categoryId"
            required
            defaultValue={post?.categoryId}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm"
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

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
            Extracto (resumen para la lista)
          </label>
          <textarea
            name="excerpt"
            defaultValue={post?.excerpt ?? ""}
            rows={3}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm"
          />
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-2">
            Estado
          </label>
          <div className="flex gap-2 text-sm">
            <label className="flex-1 text-center border border-neutral-300 rounded-md py-2 cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:border-ink">
              <input
                type="radio"
                name="status"
                value="PUBLISHED"
                defaultChecked={post ? post.status === "PUBLISHED" : true}
                className="sr-only"
              />
              Publicada
            </label>
            <label className="flex-1 text-center border border-neutral-300 rounded-md py-2 cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:border-ink">
              <input
                type="radio"
                name="status"
                value="DRAFT"
                defaultChecked={post ? post.status === "DRAFT" : false}
                className="sr-only"
              />
              Borrador
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="bg-accent text-white text-sm font-medium rounded-lg py-3"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
