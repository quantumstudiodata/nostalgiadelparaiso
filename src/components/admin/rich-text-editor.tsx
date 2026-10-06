"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { useEffect, useRef, useState } from "react";
import { PostImage, type ImageAlign } from "./post-image";
import { uploadImage } from "@/lib/upload-image";

const FONT_OPTIONS = [
  { label: "Por defecto", value: "" },
  { label: "Serif (títulos)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Sans (cuerpo)", value: "'DM Sans', system-ui, sans-serif" },
  { label: "Monoespaciada", value: "'Courier New', monospace" },
];

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`w-9 h-9 rounded-full flex items-center justify-center text-[15px] ${
        active ? "bg-ink text-white" : "hover:bg-panel text-neutral-800"
      }`}
    >
      {children}
    </button>
  );
}

const IMAGE_WIDTHS = ["25%", "33%", "50%", "75%", "100%"];

function ImageButton({ editor }: { editor: Editor }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const src = await uploadImage(file);
      editor.chain().focus().setImage({ src, alt: "" }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="h-9 px-3 rounded-full flex items-center gap-1.5 text-[15px] hover:bg-panel disabled:opacity-60"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="M21 16l-5-5-9 9" />
        </svg>
        {uploading ? "Subiendo..." : "Imagen"}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </>
  );
}

/** Floating menu on the selected image: position and size, like in Word. */
function ImageControls({ editor }: { editor: Editor }) {
  const attrs = editor.getAttributes("image") as { align?: ImageAlign; width?: string };
  const setAlign = (align: ImageAlign) => editor.chain().focus().updateAttributes("image", { align }).run();
  const options: { value: ImageAlign; label: string; title: string }[] = [
    { value: "left", label: "Izquierda", title: "Izquierda, texto alrededor" },
    { value: "center", label: "Centrada", title: "Centrada" },
    { value: "right", label: "Derecha", title: "Derecha, texto alrededor" },
  ];
  const keep = (e: React.MouseEvent) => e.preventDefault();

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="imageMenu"
      shouldShow={({ editor: ed }) => ed.isActive("image")}
      options={{ placement: "top", offset: 8 }}
      className="z-20 flex flex-wrap items-center gap-1 p-1.5 rounded-full bg-ink text-white text-[13px] shadow-lg max-w-[92vw]"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.title}
          onMouseDown={keep}
          onClick={() => setAlign(o.value)}
          className={`h-8 px-3 rounded-full ${attrs.align === o.value ? "bg-white text-ink" : "hover:bg-white/15"}`}
        >
          {o.label}
        </button>
      ))}
      <span className="w-px h-5 bg-white/30 mx-0.5" />
      <label className="flex items-center gap-1 pl-1">
        <span className="sr-only sm:not-sr-only">Tamaño</span>
        <select
          value={attrs.width ?? "100%"}
          onChange={(e) => editor.chain().focus().updateAttributes("image", { width: e.target.value }).run()}
          className="h-8 rounded-full px-2 bg-white text-ink"
        >
          {IMAGE_WIDTHS.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        title="Quitar imagen"
        aria-label="Quitar imagen"
        onMouseDown={keep}
        onClick={() => editor.chain().focus().deleteSelection().run()}
        className="h-8 w-8 rounded-full hover:bg-white/15"
      >
        ✕
      </button>
    </BubbleMenu>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="sticky top-0 z-10 bg-white pb-1">
    <div className="flex flex-wrap items-center gap-1 p-1.5 border border-mist rounded-[22px] bg-white">
      <ToolbarButton
        label="Negrita"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        label="Cursiva"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        label="Subrayado"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span style={{ textDecoration: "underline" }}>U</span>
      </ToolbarButton>
      <ToolbarButton
        label="Tachado"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span style={{ textDecoration: "line-through" }}>S</span>
      </ToolbarButton>

      <div className="w-px h-[22px] bg-mist mx-1" />

      <select
        aria-label="Tipo de letra"
        className="text-[15px] h-9 rounded-full px-3 bg-panel"
        onChange={(e) => {
          const value = e.target.value;
          if (value) editor.chain().focus().setFontFamily(value).run();
          else editor.chain().focus().unsetFontFamily().run();
        }}
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Tamaño de texto"
        className="text-[15px] h-9 rounded-full px-3 bg-panel"
        onChange={(e) => {
          const level = Number(e.target.value);
          if (!level) editor.chain().focus().setParagraph().run();
          else
            editor
              .chain()
              .focus()
              .setHeading({ level: level as 1 | 2 | 3 })
              .run();
        }}
      >
        <option value="0">Texto normal</option>
        <option value="1">Título grande</option>
        <option value="2">Título mediano</option>
        <option value="3">Título pequeño</option>
      </select>

      <div className="w-px h-[22px] bg-mist mx-1" />

      <ToolbarButton
        label="Alinear a la izquierda"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h10M4 18h14" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        label="Centrar"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M7 12h10M5 18h14" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        label="Alinear a la derecha"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M10 12h10M6 18h14" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        label="Justificar"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </ToolbarButton>

      <div className="w-px h-[22px] bg-mist mx-1" />

      <ToolbarButton
        label="Lista con viñetas"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" />
          <path d="M9 6h11M9 12h11M9 18h11" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        label="Cita"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        &ldquo;&rdquo;
      </ToolbarButton>

      <div className="w-px h-[22px] bg-mist mx-1" />

      <ImageButton editor={editor} />
    </div>
    </div>
  );
}

export function RichTextEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    // Re-render on every transaction so the toolbar reflects the current selection (bold, image selected, ...).
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      PostImage,
    ],
    content: defaultValue || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "post-content prose max-w-none min-h-[360px] px-1 py-5 font-serif focus:outline-none [&_img.ProseMirror-selectednode]:outline-3 [&_img.ProseMirror-selectednode]:outline-accent [&_img]:cursor-grab",
      },
    },
  });

  // Keep a hidden input in sync so the surrounding <form> submits the HTML.
  const html = editor?.getHTML() ?? defaultValue ?? "";

  return (
    <div className="bg-white">
      {editor && <Toolbar editor={editor} />}
      {editor && <ImageControls editor={editor} />}
      <EditorContent editor={editor} />
      <HiddenSync name={name} editor={editor} fallback={html} />
    </div>
  );
}

function HiddenSync({
  name,
  editor,
  fallback,
}: {
  name: string;
  editor: Editor | null;
  fallback: string;
}) {
  // A plain controlled value re-renders too often with Tiptap; instead push
  // updates into a ref-backed hidden input directly from the editor's
  // "update" transaction event.
  useEffect(() => {
    if (!editor) return;
    const input = document.getElementById(`${name}-hidden`) as HTMLInputElement | null;
    if (!input) return;

    const sync = () => {
      input.value = editor.getHTML();
    };
    sync();
    editor.on("update", sync);
    return () => {
      editor.off("update", sync);
    };
  }, [editor, name]);

  return <input type="hidden" id={`${name}-hidden`} name={name} defaultValue={fallback} />;
}
