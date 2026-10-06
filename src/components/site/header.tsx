import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";
import { getSocialLinks } from "@/lib/social-links";
import { getSiteBlock } from "@/lib/site-blocks";
import { isManager } from "@/lib/permissions";
import { isPreviewing } from "@/lib/edit-mode";
import { updateSiteBlockField } from "@/app/actions/site-content";
import { SiteMenu } from "@/components/site/site-menu";
import { navWithLabels } from "@/components/site/nav-links";
import { SocialLinksEditor } from "@/components/site/social-links-editor";
import { EditableText } from "@/components/site/editable";
import { InstagramIcon, TikTokIcon, FacebookIcon, SearchIcon, UserIcon, PencilIcon } from "@/components/site/icons";

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5M5 12h11" />
    </svg>
  );
}

export async function SiteHeader() {
  const [session, social, navLabels, previewing] = await Promise.all([
    auth(),
    getSocialLinks(),
    getSiteBlock<Record<string, string>>("site.nav"),
    isPreviewing(),
  ]);
  const user = session?.user;
  const manager = isManager(user?.role);
  const editing = manager && !previewing;
  const links = navWithLabels(navLabels);

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
      {editing && (
        <div className="bg-slate text-white">
          <div className="wrap py-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-2 font-bold">
              <PencilIcon size={15} />
              Modo edición
            </span>
            <span className="hidden lg:inline text-lilac">Pasa el cursor sobre cualquier texto o imagen para editarlo.</span>
            <div className="ml-auto flex items-center gap-3">
              <Link href="/admin/entradas/nueva" className="border border-white/50 rounded-full px-4 py-1.5">+ Nueva entrada</Link>
              <Link href="/admin" className="border border-white/50 rounded-full px-4 py-1.5">Panel</Link>
              <a href="/admin/vista-previa" className="border border-white/50 rounded-full px-4 py-1.5">Ver mi página</a>
            </div>
          </div>
        </div>
      )}
      {manager && previewing && (
        <div className="bg-lilac text-ink">
          <div className="wrap py-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <span>Estás viendo tu página como la ven los visitantes.</span>
            <div className="ml-auto flex items-center gap-3">
              <a href="/admin/vista-previa?salir=1&a=/" className="underline underline-offset-4">Volver a editar</a>
              <a href="/admin/vista-previa?salir=1" className="underline underline-offset-4">Ir al panel</a>
            </div>
          </div>
        </div>
      )}

      <div className="bg-ink text-white">
        <div className="wrap h-11 lg:h-12 flex items-center justify-between text-[15px]">
          <div className="flex items-center gap-5 lg:gap-[22px]">
            <Link href="/blog" aria-label="Buscar entradas" className="flex">
              <SearchIcon />
            </Link>
            {socialItems.map(({ url, label, Icon }) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex">
                <Icon />
              </a>
            ))}
            {editing && <SocialLinksEditor links={social} />}
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2 hover:underline underline-offset-4" title="Ir a mi panel">
                <UserIcon />
                <span className="max-w-[160px] truncate">{user.name}</span>
              </Link>
              <form action={logout}>
                <button aria-label="Cerrar sesión" title="Cerrar sesión" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15">
                  <LogoutIcon />
                </button>
              </form>
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

      <div className="bg-white">
        <div className="wrap h-[76px] lg:h-24 flex items-center gap-10 lg:gap-12">
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/images/logo.png" alt="Nostalgia del paraíso" width={431} height={178} className="h-11 lg:h-[52px] w-auto" priority />
          </Link>
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-base font-medium ml-auto">
            {links.map((link) =>
              editing ? (
                <EditableText
                  key={link.key}
                  as="span"
                  canEdit
                  value={link.label}
                  onSave={updateSiteBlockField.bind(null, "site.nav", link.key)}
                  href={link.href}
                  className="whitespace-nowrap"
                />
              ) : (
                <Link key={link.key} href={link.href} className="hover:text-accent whitespace-nowrap">
                  {link.label}
                </Link>
              ),
            )}
          </nav>
          <Link href="/blog#suscribirse" className="hidden sm:inline-block bg-ink text-white rounded-full px-6 py-3.5 text-[15px] font-medium ml-auto md:ml-0">
            Suscribirse
          </Link>
          <div className="ml-auto sm:ml-0">
            <SiteMenu links={links} />
          </div>
        </div>
      </div>
    </header>
  );
}
