"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { queueEdit } from "@/components/site/edit-session";
import { uploadImage } from "@/lib/upload-image";

function PencilIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function PencilButton({ onClick, label = "Editar" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="absolute -top-2.5 -right-2.5 z-10 w-6 h-6 rounded-full bg-accent text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md"
    >
      <PencilIcon />
    </button>
  );
}

/** Bolds the lead-in of each paragraph up to its first colon ("Voces del sur: ..."). */
function withBoldLeads(text: string): ReactNode {
  return text.split("\n").map((line, i, lines) => {
    const colon = line.indexOf(":");
    const content =
      colon > 0 && colon < 120 ? (
        <>
          <strong className="font-semibold text-ink">{line.slice(0, colon + 1)}</strong>
          {line.slice(colon + 1)}
        </>
      ) : (
        line
      );
    return (
      <span key={i}>
        {content}
        {i < lines.length - 1 && "\n"}
      </span>
    );
  });
}

/** Inline-editable text (or multiline block) shown directly on the live page. */
export function EditableText({
  canEdit,
  value,
  onSave,
  multiline = false,
  className = "",
  placeholder = "Escribe aquí...",
  as: Tag = "div",
  boldLeads = false,
  fontSize,
  onSaveSize,
  href,
}: {
  canEdit: boolean;
  value: string;
  onSave: (value: string) => Promise<void>;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  as?: "div" | "h1" | "h2" | "h3" | "p" | "span";
  /** Display-only: bold each paragraph's text up to its first colon. */
  boldLeads?: boolean;
  /** Saved font size in px; overrides the size in className (on every screen). */
  fontSize?: number | string;
  /** When given, the editor shows a numeric font-size control. */
  onSaveSize?: (size: string) => Promise<void>;
  /** Makes the text a link (it still navigates in edit mode; the pencil edits it). */
  href?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [current, setCurrent] = useState(value);
  const initialSize = Number(fontSize) || 0;
  const [size, setSize] = useState(initialSize);
  const [sizeDraft, setSizeDraft] = useState(initialSize);
  const editKey = useId();
  const textStyle = {
    ...(multiline ? { whiteSpace: "pre-line" as const } : {}),
    ...(size ? { fontSize: `${size}px` } : {}),
  };

  const shown = current ? (boldLeads ? withBoldLeads(current) : current) : null;
  const linked = (content: ReactNode) => (href ? <Link href={href} className="hover:text-accent">{content}</Link> : content);

  if (!canEdit) {
    return (
      <Tag className={className} style={textStyle}>
        {linked(shown)}
      </Tag>
    );
  }

  if (!editing) {
    return (
      <span className="group relative block">
        <Tag className={className} style={textStyle}>
          {shown ? linked(shown) : <span className="text-neutral-400">{placeholder}</span>}
        </Tag>
        <PencilButton
          onClick={() => {
            setDraft(current);
            setSizeDraft(size);
            setEditing(true);
          }}
        />
      </span>
    );
  }

  function save() {
    const next = draft;
    const nextSize = sizeDraft;
    setCurrent(next);
    setSize(nextSize);
    setEditing(false);
    // Saved with "Guardar cambios" in the edit bar.
    if (next !== current) queueEdit(`${editKey}:text`, () => onSave(next));
    if (onSaveSize && nextSize !== size) queueEdit(`${editKey}:size`, () => onSaveSize(nextSize ? String(nextSize) : ""));
  }

  return (
    <span className="block border-2 border-accent rounded-md p-2 bg-white">
      {multiline ? (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          className="w-full text-sm text-neutral-900 border border-neutral-300 rounded p-2"
        />
      ) : (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full text-sm text-neutral-900 border border-neutral-300 rounded p-2"
        />
      )}
      {onSaveSize && (
        <span className="flex flex-wrap items-center gap-2 mt-2 text-xs text-neutral-800">
          <label htmlFor={`size-${value.slice(0, 8)}`}>Tamaño de letra</label>
          <button type="button" aria-label="Más chica" onClick={() => setSizeDraft((n) => Math.max(8, (n || 16) - 1))} className="w-7 h-7 border border-neutral-300 rounded">
            −
          </button>
          <input
            id={`size-${value.slice(0, 8)}`}
            type="number"
            min={8}
            max={160}
            value={sizeDraft || ""}
            placeholder="auto"
            onChange={(e) => setSizeDraft(Math.min(160, Math.max(0, Number(e.target.value) || 0)))}
            className="w-16 h-7 border border-neutral-300 rounded px-1.5 text-center"
          />
          <button type="button" aria-label="Más grande" onClick={() => setSizeDraft((n) => Math.min(160, (n || 16) + 1))} className="w-7 h-7 border border-neutral-300 rounded">
            +
          </button>
          <span className="text-neutral-500">px</span>
          {sizeDraft > 0 && (
            <button type="button" onClick={() => setSizeDraft(0)} className="underline text-neutral-600">
              Tamaño original
            </button>
          )}
        </span>
      )}
      <div className="flex gap-2 mt-2">
        <button type="button" onClick={save} className="text-xs bg-ink text-white px-3 py-1.5 rounded">
          Guardar
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs border border-neutral-300 text-neutral-700 px-3 py-1.5 rounded"
        >
          Cancelar
        </button>
      </div>
    </span>
  );
}

/** A single editable call-to-action: text + destination URL. */
export function EditableButton({
  canEdit,
  text,
  url,
  onSave,
  className = "",
}: {
  canEdit: boolean;
  text: string;
  url: string;
  onSave: (value: { text: string; url: string }) => Promise<void>;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ text, url });
  const [current, setCurrent] = useState({ text, url });
  const editKey = useId();

  if (!canEdit) {
    return (
      <a href={current.url} className={className}>
        {current.text}
      </a>
    );
  }

  if (!editing) {
    return (
      <span className="group relative inline-flex">
        <a href={current.url} className={className}>
          {current.text}
        </a>
        <PencilButton
          label="Editar botón"
          onClick={() => {
            setDraft(current);
            setEditing(true);
          }}
        />
      </span>
    );
  }

  function save() {
    const next = draft;
    setCurrent(next);
    setEditing(false);
    queueEdit(editKey, () => onSave(next));
  }

  return (
    <span className="inline-flex flex-col gap-1.5 border-2 border-accent rounded-md p-2.5 bg-white">
      <input
        autoFocus
        value={draft.text}
        onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
        placeholder="Texto del botón"
        className="text-xs text-neutral-900 border border-neutral-300 rounded px-2 py-1.5 w-44"
      />
      <input
        value={draft.url}
        onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
        placeholder="/acerca-de-nosotros o https://..."
        className="text-xs text-neutral-900 border border-neutral-300 rounded px-2 py-1.5 w-44"
      />
      <div className="flex gap-1.5">
        <button type="button" onClick={save} className="text-[11px] bg-ink text-white px-2.5 py-1 rounded">
          Guardar
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-[11px] border border-neutral-300 text-neutral-700 px-2.5 py-1 rounded"
        >
          Cancelar
        </button>
      </div>
    </span>
  );
}

export type EditableButtonItem = { id: string; text: string; url: string };

/** A free-form list of extra buttons the editor can add/edit/remove. */
export function EditableButtonList({
  canEdit,
  buttons,
  onSave,
  buttonClassName = "",
}: {
  canEdit: boolean;
  buttons: EditableButtonItem[];
  onSave: (buttons: EditableButtonItem[]) => Promise<void>;
  buttonClassName?: string;
}) {
  const [list, setList] = useState<EditableButtonItem[]>(buttons);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ text: "", url: "" });
  const editKey = useId();

  function persist(next: EditableButtonItem[]) {
    setList(next);
    queueEdit(editKey, () => onSave(next));
  }

  function startEdit(btn: EditableButtonItem) {
    setEditingId(btn.id);
    setDraft({ text: btn.text, url: btn.url });
  }

  function saveEdit() {
    if (!editingId) return;
    persist(list.map((b) => (b.id === editingId ? { ...b, ...draft } : b)));
    setEditingId(null);
  }

  function removeBtn(id: string) {
    persist(list.filter((b) => b.id !== id));
  }

  function addBtn() {
    const next: EditableButtonItem = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now()),
      text: "Nuevo botón",
      url: "/",
    };
    persist([...list, next]);
    startEdit(next);
  }

  if (!canEdit) {
    return (
      <>
        {list.map((b) => (
          <a key={b.id} href={b.url} className={buttonClassName}>
            {b.text}
          </a>
        ))}
      </>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {list.map((btn) => (
        <span key={btn.id} className="group relative inline-flex">
          {editingId === btn.id ? (
            <span className="flex flex-col gap-1.5 border-2 border-accent rounded-md p-2.5 bg-white">
              <input
                autoFocus
                value={draft.text}
                onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                placeholder="Texto"
                className="text-xs text-neutral-900 border border-neutral-300 rounded px-2 py-1.5 w-40"
              />
              <input
                value={draft.url}
                onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
                placeholder="/pagina o https://..."
                className="text-xs text-neutral-900 border border-neutral-300 rounded px-2 py-1.5 w-40"
              />
              <div className="flex gap-1.5">
                <button type="button" onClick={saveEdit} className="text-[11px] bg-ink text-white px-2.5 py-1 rounded">
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-[11px] border border-neutral-300 text-neutral-700 px-2.5 py-1 rounded"
                >
                  Cancelar
                </button>
              </div>
            </span>
          ) : (
            <>
              <a href={btn.url} className={buttonClassName}>
                {btn.text}
              </a>
              <button
                type="button"
                onClick={() => startEdit(btn)}
                aria-label="Editar botón"
                className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-accent text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px]"
              >
                <PencilIcon />
              </button>
              <button
                type="button"
                onClick={() => removeBtn(btn.id)}
                aria-label="Quitar botón"
                className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[11px] leading-none"
              >
                ×
              </button>
            </>
          )}
        </span>
      ))}
      <button
        type="button"
        onClick={addBtn}
        className="text-xs border border-dashed border-neutral-400 text-neutral-600 rounded-md px-3 py-2 hover:bg-neutral-50"
      >
        + Agregar botón
      </button>
    </div>
  );
}

/** An image with a hover pencil that opens a direct upload-to-replace control. */
export function EditableImage({
  canEdit,
  url,
  onSave,
  className = "",
  children,
  alt = "",
}: {
  canEdit: boolean;
  url: string;
  onSave: (url: string) => Promise<void>;
  className?: string;
  children?: ReactNode;
  /** Description of the image, for Google Images and screen readers. */
  alt?: string;
}) {
  const [current, setCurrent] = useState(url);
  const [uploading, setUploading] = useState(false);
  const editKey = useId();

  const image = current ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={current} alt={alt} className="w-full h-full object-cover" />
  ) : (
    children
  );

  if (!canEdit) {
    return <div className={className}>{image}</div>;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setCurrent(url);
      queueEdit(editKey, () => onSave(url));
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className={`group relative ${className}`}>
      {image}
      <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors cursor-pointer">
        <span className="opacity-0 group-hover:opacity-100 bg-white text-ink text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <PencilIcon />
          {uploading ? "Subiendo..." : "Cambiar imagen"}
        </span>
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
}
