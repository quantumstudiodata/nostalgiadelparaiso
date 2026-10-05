import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/react";

export type ImageAlign = "left" | "center" | "right";

/** Inline style for an image placed inside a post, Word-like: centered on its own, or floated with text around it. */
export function imageStyle(align: ImageAlign, width: string) {
  if (align === "left") return `float:left;width:${width};margin:0.3em 1.5em 1em 0;`;
  if (align === "right") return `float:right;width:${width};margin:0.3em 0 1em 1.5em;`;
  return `display:block;width:${width};margin:1.5em auto;`;
}

/** Image node with alignment and width, draggable inside the editor. */
export const PostImage = Image.extend({
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (el) => (el.getAttribute("data-align") as ImageAlign) || "center",
        renderHTML: (attrs) => ({ "data-align": attrs.align }),
      },
      width: {
        default: "100%",
        parseHTML: (el) => el.style.width || "100%",
        renderHTML: () => ({}),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes, { style: imageStyle(node.attrs.align, node.attrs.width) })];
  },
}).configure({ inline: false, allowBase64: false });
