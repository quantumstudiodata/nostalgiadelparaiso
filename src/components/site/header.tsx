import Link from "next/link";
import Image from "next/image";
import { SiteMenu } from "@/components/site/site-menu";

export function SiteHeader() {
  return (
    <header>
      <div className="bg-ink text-white h-[45px]">
        <div className="max-w-[1100px] mx-auto h-full flex items-center px-6 md:px-10 gap-5">
          <button aria-label="Buscar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="10.5" cy="10.5" r="7" />
              <path d="M21 21l-5.5-5.5" />
            </svg>
          </button>
          <a href="#" aria-label="Instagram" className="w-5 h-5 rounded-full bg-white text-ink flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </a>
          <a href="#" aria-label="TikTok">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.3v12.4a2.6 2.6 0 1 1-1.8-2.5V9.5a5.9 5.9 0 1 0 5.1 5.9V9a7.6 7.6 0 0 0 4.4 1.4V7.1a4.3 4.3 0 0 1-3.3-1.3Z" />
            </svg>
          </a>
          <a href="#" aria-label="Facebook">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 8V6.3c0-.8.2-1.3 1.4-1.3H17V2h-2.6C11.3 2 10.3 3.5 10.3 6v2H8v3h2.3v11H14V11h2.6l.4-3Z" />
            </svg>
          </a>
        </div>
      </div>
      <div className="bg-white">
        <div className="max-w-[1100px] mx-auto h-[73px] flex items-center px-6 md:px-10 gap-6">
          <Link href="/admin/login" className="flex items-center gap-3 text-[15px] text-accent whitespace-nowrap md:w-[260px]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-ink shrink-0">
              <circle cx="12" cy="12" r="12" />
              <circle cx="12" cy="9.5" r="3.6" fill="white" />
              <path d="M5.5 19.2c1.3-2.6 3.8-4 6.5-4s5.2 1.4 6.5 4a9 9 0 0 1-13 0Z" fill="white" />
            </svg>
            <span className="hidden sm:inline">Iniciar sesión</span>
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
          <div className="ml-auto">
            <SiteMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
