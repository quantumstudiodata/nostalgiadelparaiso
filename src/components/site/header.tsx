import Link from "next/link";
import Image from "next/image";

export function SiteHeader() {
  return (
    <>
      <div className="bg-ink text-white h-10">
        <div className="site-container h-full flex items-center px-6 gap-4 text-sm">
          <button aria-label="Buscar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>
          <a href="#" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </a>
          <a href="#" aria-label="TikTok">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
              <path d="M15 3c0 2.5 2 4.5 4.5 4.5" />
            </svg>
          </a>
          <a href="#" aria-label="Facebook">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 4h-2a4 4 0 0 0-4 4v3H7v3h2v6h3v-6h2.5l.5-3H12V8a1 1 0 0 1 1-1h2Z" />
            </svg>
          </a>
        </div>
      </div>
      <div className="border-b border-neutral-100">
        <div className="site-container h-[76px] flex items-center justify-between px-6">
          <Link href="/admin/login" className="flex items-center gap-2 text-sm text-neutral-500 whitespace-nowrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
            Iniciar sesión
          </Link>
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Nostalgia del paraíso"
              width={431}
              height={178}
              className="h-11 w-auto"
              priority
            />
          </Link>
          <button aria-label="Menú" className="w-10 h-10 shrink-0 rounded-full bg-ink text-white flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
