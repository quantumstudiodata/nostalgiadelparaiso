import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";
import { getSocialLinks } from "@/lib/social-links";
import { isManager, canWritePosts } from "@/lib/permissions";
import { SiteMenu } from "@/components/site/site-menu";
import { NAV_LINKS } from "@/components/site/nav-links";
import { SocialLinksEditor } from "@/components/site/social-links-editor";
import { InstagramIcon, TikTokIcon, FacebookIcon, SearchIcon, UserIcon, PencilIcon } from "@/components/site/icons";

export async function SiteHeader() {
  const [session, social] = await Promise.all([auth(), getSocialLinks()]);
  const user = session?.user;
  const manager = isManager(user?.role);

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const socialItems = [
    { url: social.instagram, label: "Instagram", Icon: InstagramIcon },
    { url: social.tiktok, label: "TikTok", Icon: TikTokIcon },
    { url: social.facebook, label: "Facebook", Icon: FacebookIcon },
  ].filter((s) => s.url);

  return (
    <header>
      {manager && (
        <div className="bg-slate text-white">
          <div className="max-w-[1280px] mx-auto px-6 md:px-14 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-2 font-bold">
              <PencilIcon size={15} />
              Modo edición
            </span>
            <span className="hidden lg:inline text-lilac">
              Pasa el cursor sobre cualquier texto o imagen para editarlo. Los cambios se guardan solos.
            </span>
            <div className="ml-auto flex items-center gap-3">
              <Link href="/admin/entradas/nueva" className="border border-white/50 rounded-full px-4 py-1.5">
                + Nueva entrada
              </Link>
              <Link href="/admin" className="border border-white/50 rounded-full px-4 py-1.5">
                Mis entradas
              </Link>
              <form action={logout}>
                <button className="px-1">Salir</button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-ink text-white">
        <div className="max-w-[1280px] mx-auto h-11 px-6 md:px-14 flex items-center justify-between text-sm">
          <div className="flex items-center gap-[18px]">
            <Link href="/blog" aria-label="Buscar entradas" className="flex">
              <SearchIcon />
            </Link>
            {socialItems.map(({ url, label, Icon }) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex">
                <Icon />
              </a>
            ))}
            {manager && <SocialLinksEditor links={social} />}
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:flex items-center gap-2">
                <UserIcon />
                {user.name}
              </span>
              {!manager && canWritePosts(user.role) && (
                <Link href="/admin" className="underline underline-offset-4">Mis entradas</Link>
              )}
              {!manager && (
                <form action={logout}>
                  <button>Salir</button>
                </form>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/admin/login" className="flex items-center gap-2">
                <UserIcon />
                Iniciar sesión
              </Link>
              <Link href="/registro" className="hidden sm:inline underline underline-offset-4">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-b border-mist">
        <div className="max-w-[1280px] mx-auto h-[88px] px-6 md:px-14 flex items-center gap-10">
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/images/logo.png" alt="Nostalgia del paraíso" width={431} height={178} className="h-[46px] w-auto" priority />
          </Link>
          <nav className="hidden md:flex gap-[30px] text-[15px] font-medium ml-auto">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-accent">
                {link.label}
              </Link>
            ))}
          </nav>
          <a href="#contacto" className="hidden sm:inline-block bg-ink text-white rounded-full px-[22px] py-3 text-sm font-medium ml-auto md:ml-0">
            Suscribirse
          </a>
          <div className="ml-auto sm:ml-0">
            <SiteMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
