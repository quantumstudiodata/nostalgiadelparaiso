import { Node, mergeAttributes } from "@tiptap/react";

/** "Ficha": a highlighted card around one or more paragraphs (dark box with a "Ficha" label on the post). */
export const Ficha = Node.create({
  name: "ficha",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: "aside.ficha" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["aside", mergeAttributes(HTMLAttributes, { class: "ficha" }), 0];
  },
});
