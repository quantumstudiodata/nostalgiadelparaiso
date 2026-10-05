"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { useEffect } from "react";

const FONT_OPTIONS = [
  { label: "Por defecto", value: "" },
  { label: "Serif (títulos)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Sans (cuerpo)", value: "'Source Sans Pro', system-ui, sans-serif" },
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
      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
        active ? "bg-ink text-white" : "hover:bg-panel text-neutral-800"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-1.5 border border-mist rounded-[24px] bg-white">
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
        className="text-sm h-9 rounded-full px-3 bg-panel"
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
        className="text-sm h-9 rounded-full px-3 bg-panel"
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
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: defaultValue || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[360px] px-1 py-6 font-serif focus:outline-none",
      },
    },
  });

  // Keep a hidden input in sync so the surrounding <form> submits the HTML.
  const html = editor?.getHTML() ?? defaultValue ?? "";

  return (
    <div className="bg-white">
      {editor && <Toolbar editor={editor} />}
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
