/** Branded HTML for the subscriber emails. Inline styles and tables only, so it looks right in Gmail and Outlook. */

const LILAC = "#ddd7e3";
const INK = "#111111";
const MUTED = "#6b6b6b";

export function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** First words of a post's HTML as plain text, for the email body. */
export function postSummary(html: string, words = 70) {
  const text = html
    .replace(/<\/(p|h\d|li|blockquote)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  const list = text.split(" ");
  return list.length > words ? `${list.slice(0, words).join(" ")}…` : text;
}

function layout({ base, preheader, content, unsubscribeUrl }: { base: string; preheader: string; content: string; unsubscribeUrl?: string }) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nostalgia del paraíso</title></head>
<body style="margin:0;padding:0;background:${LILAC}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LILAC}">
<tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px">
    <tr><td align="center" style="padding:32px 32px 8px">
      <a href="${base}" style="text-decoration:none"><img src="${base}/images/logo.png" width="150" alt="Nostalgia del paraíso" style="display:block;width:150px;height:auto;border:0"></a>
    </td></tr>
    <tr><td style="padding:8px 40px 0"><div style="height:1px;background:${LILAC}"></div></td></tr>
    ${content}
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td align="center" style="padding:20px 24px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${MUTED}">
      Recibes este correo porque te suscribiste a Nostalgia del paraíso.${
        unsubscribeUrl ? `<br><a href="${unsubscribeUrl}" style="color:${MUTED};text-decoration:underline">Darme de baja</a>` : ""
      }
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:999px;background:${INK}">
<a href="${href}" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px">${label}</a>
</td></tr></table>`;
}

export function newPostEmail(p: {
  base: string;
  title: string;
  writerName: string;
  writerAvatarUrl?: string | null;
  body: string;
  postUrl: string;
  unsubscribeUrl: string;
}) {
  const avatar = p.writerAvatarUrl
    ? `<img src="${p.writerAvatarUrl.startsWith("http") ? p.writerAvatarUrl : p.base + p.writerAvatarUrl}" width="36" height="36" alt="" style="display:block;width:36px;height:36px;border-radius:50%;object-fit:cover">`
    : "";
  return layout({
    base: p.base,
    preheader: p.body.slice(0, 120),
    unsubscribeUrl: p.unsubscribeUrl,
    content: `
    <tr><td style="padding:28px 40px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:.14em;text-transform:uppercase;color:#a24c2f">Nueva entrada</td></tr>
    <tr><td style="padding:10px 40px 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:bold;color:${INK}">${escapeHtml(p.title)}</td></tr>
    <tr><td style="padding:16px 40px 0">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        ${avatar ? `<td style="padding-right:10px">${avatar}</td>` : ""}
        <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${MUTED}">por <strong style="color:${INK}">${escapeHtml(p.writerName)}</strong></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:20px 40px 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.75;color:#333333">${escapeHtml(p.body)}</td></tr>
    <tr><td style="padding:28px 40px 40px">${button(p.postUrl, "Leer la entrada")}</td></tr>`,
  });
}

export function welcomeEmail(p: { base: string; unsubscribeUrl: string }) {
  return layout({
    base: p.base,
    preheader: "Te avisaremos cada vez que haya una entrada nueva.",
    unsubscribeUrl: p.unsubscribeUrl,
    content: `
    <tr><td align="center" style="padding:28px 40px 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;font-weight:bold;color:${INK}">¡Gracias por suscribirte!</td></tr>
    <tr><td align="center" style="padding:16px 40px 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.75;color:#333333">
      Ya formas parte de <strong>Nostalgia del paraíso</strong>, un ecosistema cultural de poesía, lectura y cultura de paz.<br><br>
      Cada vez que se publique una entrada nueva te llegará un aviso a este correo.
    </td></tr>
    <tr><td align="center" style="padding:28px 40px 40px">${button(`${p.base}/blog`, "Leer las entradas")}</td></tr>`,
  });
}
