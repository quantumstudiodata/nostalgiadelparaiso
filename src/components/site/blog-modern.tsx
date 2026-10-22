"use client";

import Link, { useLinkStatus } from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { likePost, subscribe, type FormState } from "@/app/actions/community";
import { updateSiteBlockField } from "@/app/actions/site-content";

const LIKED_KEY = "ndp-liked-posts";
const SAVED_KEY = "ndp-saved-posts";

function readList(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

function writeList(key: string, id: string, on: boolean) {
  try {
    const list = readList(key).filter((x) => x !== id);
    localStorage.setItem(key, JSON.stringify(on ? [...list, id] : list));
  } catch {}
}

/** Reads the post aloud with the browser's voice (Spanish when available). */
export function ListenButton({ text, className = "", label = "Escuchar" }: { text: string; className?: string; label?: string }) {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!("speechSynthesis" in window)) queueMicrotask(() => setSupported(false));
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (playing) {
      synth.cancel();
      setPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    const voice = synth.getVoices().find((v) => v.lang.startsWith("es"));
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    synth.cancel();
    synth.speak(utterance);
    setPlaying(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition hover:-translate-y-0.5 ${className}`}
    >
      {playing ? (
        <span className="eq" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
      {playing ? "Escuchando… (detener)" : label}
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className={filled ? "pop" : ""}>
      <path d="M12 21s-7.5-4.6-9.3-9.3C1.4 8 3.6 4.5 7 4.5c2 0 3.4 1 5 3 1.6-2 3-3 5-3 3.4 0 5.6 3.5 4.3 7.2C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

/**
 * Like, comments, save, share and copy link. A sticky vertical rail beside the text on large screens
 * and a floating bar at the bottom on phones.
 */
export function PostActions({ postId, initialLikes, url, title }: { postId: string; initialLikes: number; url: string; title: string }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Read after mount so server and client render the same markup.
    const isLiked = readList(LIKED_KEY).includes(postId);
    const isSaved = readList(SAVED_KEY).includes(postId);
    queueMicrotask(() => {
      setLiked(isLiked);
      setSaved(isSaved);
    });
  }, [postId]);

  const absolute = () => new URL(url, window.location.origin).toString();

  function toggleLike() {
    const next = !liked;
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    writeList(LIKED_KEY, postId, next);
    startTransition(async () => {
      setLikes(await likePost(postId, next));
    });
  }

  function toggleSave() {
    setSaved(!saved);
    writeList(SAVED_KEY, postId, !saved);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(absolute());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  function share(target: "whatsapp" | "facebook" | "native") {
    const link = absolute();
    if (target === "native" && navigator.share) {
      navigator.share({ title, url: link }).catch(() => {});
      return;
    }
    const href =
      target === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
        : `https://wa.me/?text=${encodeURIComponent(`${title} ${link}`)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  const round = "w-10 h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center transition hover:-translate-y-0.5";
  const plain = `${round} hover:bg-panel`;

  return (
    <nav
      aria-label="Acciones de la entrada"
      className="fixed z-30 bottom-3 inset-x-3 h-14 px-2 flex items-center justify-between rounded-full bg-white/95 backdrop-blur shadow-[0_12px_32px_rgba(17,17,30,0.18)] ring-1 ring-black/5 lg:sticky lg:top-32 lg:inset-x-auto lg:bottom-auto lg:h-auto lg:w-16 lg:px-0 lg:py-2.5 lg:flex-col lg:gap-1.5 lg:bg-white"
    >
      <span className="flex items-center gap-1 lg:flex-col">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? "Quitar me gusta" : "Me gusta"}
          className={`${round} ${liked ? "bg-accent text-white" : "bg-lilac/60 text-accent"}`}
        >
          <HeartIcon filled={liked} />
        </button>
        <span className="text-xs font-bold text-accent min-w-4 text-center">{likes}</span>
      </span>
      <a href="#comentarios" aria-label="Comentarios" className={plain}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 5h16v11H8l-4 4z" />
        </svg>
      </a>
      <button
        type="button"
        onClick={toggleSave}
        aria-pressed={saved}
        aria-label={saved ? "Quitar de guardados" : "Guardar"}
        title={saved ? "Guardada en este dispositivo" : "Guardar"}
        className={`${round} ${saved ? "bg-ink text-white" : "hover:bg-panel"}`}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M6 3h12v18l-6-4-6 4z" />
        </svg>
      </button>
      <button type="button" onClick={() => share("whatsapp")} aria-label="Compartir en WhatsApp" className={plain}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z" />
        </svg>
      </button>
      <button type="button" onClick={() => share("facebook")} aria-label="Compartir en Facebook" className={plain}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v5h4v-5h3l1-4h-4V8z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "¡Enlace copiado!" : "Copiar enlace"}
        title={copied ? "¡Enlace copiado!" : "Copiar enlace"}
        className={`${round} ${copied ? "bg-ink text-white" : "hover:bg-panel"}`}
      >
        {copied ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M5 12l5 5L20 7" />
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
          </svg>
        )}
      </button>
    </nav>
  );
}

/** Horizontal list moved with ← → buttons (and by swiping on phones). */
export function ScrollCarousel({ title, children }: { title: string; children: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const move = (dir: number) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 380), behavior: "smooth" });
  };
  const arrow = "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition hover:-translate-y-0.5";

  return (
    <div className="flex flex-col gap-5 md:gap-7">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-serif font-extrabold text-[22px] md:text-[34px] leading-tight">{title}</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => move(-1)} aria-label="Anterior" className={`${arrow} border-[1.5px] border-ink bg-white`}>
            ←
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Siguiente" className={`${arrow} bg-ink text-white`}>
            →
          </button>
        </div>
      </div>
      <div ref={track} className="no-scrollbar flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-5 px-5 md:-mx-10 md:px-10 pb-4 pt-1">
        {children}
      </div>
    </div>
  );
}

export type HeroSlide = { slug: string; title: string; category: string; excerpt: string; meta: string; image: string | null };

/** Featured posts at the top of the list: one at a time, with dots and arrows; changes on its own every few seconds. */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearInterval(timer);
  }, [paused, count]);

  if (count === 0) return null;
  const go = (i: number) => setIndex((i + count) % count);

  return (
    <section
      aria-label="Entradas destacadas"
      aria-roledescription="carrusel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative mx-3 md:mx-6 h-[440px] md:h-[540px] rounded-[26px] md:rounded-[34px] overflow-hidden bg-navy text-white"
    >
      {slides.map((s, i) =>
        i === index ? (
          <div key={s.slug} className="absolute inset-0">
            {s.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.image} alt="" className="ken-burns absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[rgba(14,13,26,0.85)] via-[rgba(14,13,26,0.35)] to-transparent" />
            <div className="absolute left-5 right-5 bottom-20 md:left-16 md:right-auto md:bottom-16 md:w-[620px] flex flex-col gap-3 md:gap-5">
              <span className="rise-in self-start bg-lilac text-ink rounded-full px-3 py-1.5 text-[10px] md:text-xs font-bold tracking-[0.12em] uppercase">{s.category}</span>
              <Link href={`/blog/${s.slug}`} className="rise-in rise-in-1 font-serif font-extrabold text-[22px] md:text-[42px] leading-[1.08] tracking-[-0.02em] hover:underline decoration-2 underline-offset-8">
                {s.title}
              </Link>
              {s.excerpt && <p className="rise-in rise-in-1 text-[13px] md:text-[16px] leading-relaxed text-[#ece9f2] line-clamp-2 md:line-clamp-3 max-w-[540px]">{s.excerpt}</p>}
              <span className="rise-in rise-in-2 flex items-center gap-4">
                <Link href={`/blog/${s.slug}`} className="hidden md:inline-block bg-white text-ink rounded-full px-6 py-3.5 text-[15px] font-bold transition hover:-translate-y-0.5">
                  Leer entrada →
                </Link>
                <span className="text-xs md:text-sm text-[#e6e2ee]">{s.meta}</span>
              </span>
            </div>
          </div>
        ) : null,
      )}
      {count > 1 && (
        <div className="absolute left-5 right-5 bottom-5 md:left-auto md:right-10 md:bottom-12 flex items-center justify-between md:justify-end gap-3">
          <div className="flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ver destacada ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${i === index ? "w-7 bg-white" : "w-2 bg-white/50"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => go(index - 1)} aria-label="Anterior" className="hidden md:flex w-12 h-12 rounded-full border-[1.5px] border-white/70 bg-white/10 backdrop-blur items-center justify-center font-bold">
              ←
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Siguiente" className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-ink flex items-center justify-center font-bold">
              →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/** "Recibe todas las entradas" card; `dark` for navy panels, otherwise lilac. */
export function SubscribeCard({ id, dark = false, className = "" }: { id: string; dark?: boolean; className?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, {});
  return (
    <div
      id={id}
      className={`relative overflow-hidden flex flex-col gap-3 p-5 md:p-7 rounded-[22px] md:rounded-[28px] ${dark ? "bg-navy text-white" : "bg-lilac text-ink"} ${className}`}
    >
      {dark && <span aria-hidden="true" className="absolute -top-12 -right-10 w-36 h-36 rounded-full bg-slate" />}
      <h2 className="relative font-serif font-semibold text-[18px] md:text-[22px] leading-tight">Recibe todas las entradas</h2>
      {state.ok ? (
        <p role="status" className="relative text-sm">
          {state.message}
        </p>
      ) : (
        <form action={action} className="relative flex flex-col gap-2.5">
          <label htmlFor={`${id}-email`} className="sr-only">
            Correo electrónico
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            placeholder="tu@correo.com"
            className="h-11 md:h-12 rounded-full px-5 text-sm text-ink bg-white border-[1.5px] border-transparent focus:border-accent outline-none"
          />
          {state.error && (
            <p role="alert" className={`text-xs ${dark ? "text-red-300" : "text-red-700"}`}>
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className={`h-11 md:h-12 rounded-full text-sm font-bold transition hover:-translate-y-0.5 disabled:opacity-60 ${dark ? "bg-lilac text-ink" : "bg-ink text-white"}`}
          >
            {pending ? "Enviando…" : "Suscribirme"}
          </button>
        </form>
      )}
    </div>
  );
}

function LoadMoreLabel() {
  const { pending } = useLinkStatus();
  return (
    <>
      {pending && <span aria-hidden="true" className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
      {pending ? "Cargando…" : "Cargar más entradas"}
    </>
  );
}

/** "Cargar más": shows the next batch below the current one, keeping the scroll position. */
export function LoadMoreLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      className="inline-flex items-center gap-3 h-12 md:h-14 rounded-full px-7 md:px-8 bg-ink text-white text-sm md:text-[15px] font-bold transition hover:-translate-y-0.5"
    >
      <LoadMoreLabel />
    </Link>
  );
}

/** Edit mode: choose which post is the "Texto de la semana" (empty = automatic, the most read this week). */
export function WeeklyPicker({ current, options }: { current: string; options: { slug: string; title: string }[] }) {
  const [value, setValue] = useState(current);
  const [pending, startTransition] = useTransition();
  return (
    <label className="relative flex flex-col gap-1 text-xs text-lilac">
      Elegir el texto de la semana
      <select
        value={value}
        disabled={pending}
        onChange={(e) => {
          const slug = e.target.value;
          setValue(slug);
          startTransition(() => updateSiteBlockField("blog.weekly", "slug", slug));
        }}
        className="h-10 rounded-full bg-white text-ink px-4 text-sm max-w-[320px]"
      >
        <option value="">Automático (el más leído de la semana)</option>
        {options.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.title}
          </option>
        ))}
      </select>
    </label>
  );
}
