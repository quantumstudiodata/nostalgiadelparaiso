/** Small pixel-art emojis for comments. Written in the text as :name: tokens. */

const COLORS: Record<string, string> = {
  R: "#e0465a",
  W: "#ffffff",
  Y: "#f6c64e",
  O: "#e8a23a",
  K: "#2a2b40",
  P: "#e98bb8",
  G: "#4f9a5a",
  B: "#5b74c7",
  L: "#7fc4ef",
};

export const PIXEL_EMOJIS: Record<string, { label: string; rows: string[] }> = {
  corazon: {
    label: "Corazón",
    rows: [".RR..RR.", "RWRRRRRR", "RRRRRRRR", "RRRRRRRR", ".RRRRRR.", "..RRRR..", "...RR...", "........"],
  },
  sonrisa: {
    label: "Sonrisa",
    rows: ["..YYYY..", ".YYYYYY.", "YYKYYKYY", "YYYYYYYY", "YKYYYYKY", "YYKKKKYY", ".YYYYYY.", "..YYYY.."],
  },
  triste: {
    label: "Triste",
    rows: ["..YYYY..", ".YYYYYY.", "YYKYYKYY", "YYLYYYYY", "YYLYYYYY", "YYYKKYYY", ".YKYYKY.", "..YYYY.."],
  },
  estrella: {
    label: "Estrella",
    rows: ["...YY...", "...YY...", "YYYYYYYY", ".YYOOYY.", "..YYYY..", ".YYYYYY.", ".YY..YY.", "YY....YY"],
  },
  flor: {
    label: "Flor",
    rows: ["..P..P..", ".PPPPPP.", "PPPYYPPP", ".PPYYPP.", "..PPPP..", "...GG.G.", ".G.GGG..", "..GGG..."],
  },
  luna: {
    label: "Luna",
    rows: ["..YYYY..", ".YYY....", "YYY.....", "YYY.....", "YYY.....", "YYY.....", ".YYY....", "..YYYY.."],
  },
  libro: {
    label: "Libro",
    rows: ["........", ".BBBBBB.", ".BWWWWB.", ".BWKKWB.", ".BWWWWB.", ".BWKKWB.", ".BWWWWB.", ".BBBBBB."],
  },
};

export function PixelEmoji({ name, size = 18 }: { name: string; size?: number }) {
  const emoji = PIXEL_EMOJIS[name];
  if (!emoji) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      role="img"
      aria-label={emoji.label}
      className="inline-block align-[-3px] mx-[1px]"
    >
      {emoji.rows.flatMap((row, y) =>
        [...row].map((c, x) => (COLORS[c] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={COLORS[c]} /> : null)),
      )}
    </svg>
  );
}

/** Renders comment text with its :name: tokens as pixel emojis. */
export function WithPixelEmojis({ text }: { text: string }) {
  const parts = text.split(/:([a-z]+):/g);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 && PIXEL_EMOJIS[part] ? <PixelEmoji key={i} name={part} /> : i % 2 === 1 ? `:${part}:` : part))}
    </>
  );
}

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${value} de 5 estrellas`} style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? "text-[#e8a23a]" : "text-neutral-300"} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}
