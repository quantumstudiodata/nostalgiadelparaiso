"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { likePost } from "@/app/actions/community";

const LIKED_KEY = "ndp-liked-posts";

function readLiked(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LIKED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Outline heart that counts likes; each browser can like a post once. */
export function LikeButton({ postId, initialLikes }: { postId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Read after mount so server and client render the same markup.
    const stored = readLiked().includes(postId);
    if (stored) queueMicrotask(() => setLiked(true));
  }, [postId]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    try {
      const list = readLiked().filter((id) => id !== postId);
      localStorage.setItem(LIKED_KEY, JSON.stringify(next ? [...list, postId] : list));
    } catch {}
    startTransition(async () => {
      setLikes(await likePost(postId, next));
    });
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={liked} aria-label={liked ? "Quitar me gusta" : "Me gusta"} className="flex items-center gap-1.5 text-xs text-neutral-600">
      {likes > 0 && <span>{likes}</span>}
      <svg width="19" height="19" viewBox="0 0 24 24" fill={liked ? "#d0564f" : "none"} stroke="#d0564f" strokeWidth="1.6">
        <path d="M12 20.5s-7.5-4.6-9.3-9.3C1.4 7.7 3.6 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.4 0 5.6 3.2 4.3 6.7C19.5 15.9 12 20.5 12 20.5Z" />
      </svg>
    </button>
  );
}

/** "⋮" menu on a post: copy link or share. */
export function PostMenu({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const absolute = () => new URL(url, window.location.origin).toString();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Más opciones"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-7 h-7 -mr-2 flex items-center justify-center rounded-full hover:bg-neutral-100"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white border border-mist rounded-md shadow-lg py-1 text-sm">
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                await navigator.clipboard.writeText(absolute());
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                  setOpen(false);
                }, 1200);
              } catch {}
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-neutral-50"
          >
            {copied ? "¡Enlace copiado!" : "Copiar enlace"}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (navigator.share) navigator.share({ title, url: absolute() }).catch(() => {});
              else window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absolute())}`, "_blank");
              setOpen(false);
            }}
            className="w-full text-left px-3.5 py-2 hover:bg-neutral-50"
          >
            Compartir
          </button>
        </div>
      )}
    </div>
  );
}
