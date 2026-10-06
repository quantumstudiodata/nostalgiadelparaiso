import sanitizeHtmlLib from "sanitize-html";

export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
      "h1", "h2", "h3", "blockquote", "span", "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["style"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      img: ["src", "alt", "style", "data-align"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowedStyles: {
      "*": {
        "text-align": [/^(left|center|right|justify)$/],
        "font-family": [/^[\w\s,'"-]+$/],
        "font-size": [/^\d{1,2}(\.\d+)?px$/],
      },
      img: {
        width: [/^\d{1,3}%$/],
        float: [/^(left|right|none)$/],
        display: [/^block$/],
        margin: [/^[\d.]+(em|px)?( [\d.]+(em|px)?| auto){0,3}$/],
      },
    },
  });
}
