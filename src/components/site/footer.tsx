import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <>
      <section id="contacto" className="bg-lilac">
        <div className="wrap py-[72px] lg:py-28 grid grid-cols-1 md:grid-cols-12 gap-7 md:gap-12">
          <h2 className="md:col-span-5 font-serif font-semibold text-[27px] lg:text-[36px] leading-[1.2]">
            Escríbenos. La palabra es tuya, mía y de todos.
          </h2>
          <form className="md:col-start-7 md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-[18px] lg:gap-[22px]">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contacto-nombre" className="text-base font-medium">Nombre</label>
              <input id="contacto-nombre" className="h-[52px] lg:h-[54px] rounded-lg bg-white px-4 text-[17px]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contacto-email" className="text-base font-medium">Email</label>
              <input id="contacto-email" type="email" className="h-[52px] lg:h-[54px] rounded-lg bg-white px-4 text-[17px]" />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label htmlFor="contacto-mensaje" className="text-base font-medium">Mensaje</label>
              <textarea id="contacto-mensaje" rows={5} className="rounded-lg bg-white px-4 py-3.5 text-[17px]" />
            </div>
            <button type="submit" className="sm:col-span-2 sm:justify-self-start bg-ink text-white rounded-full px-[34px] py-4 text-[17px] font-medium">
              Enviar mensaje
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-ink text-white">
        <div className="wrap py-10 lg:py-12 flex flex-col md:flex-row items-center justify-between gap-5 text-[15px] lg:text-base">
          <Image src="/images/logo-blanco.png" alt="Nostalgia del paraíso" width={540} height={244} className="h-[52px] lg:h-14 w-auto" />
          <div className="flex gap-6 lg:gap-8">
            <Link href="/terminos-y-condiciones">Términos y Condiciones</Link>
            <Link href="/politica-de-privacidad">Política de Privacidad</Link>
          </div>
          <span className="text-neutral-300">© {new Date().getFullYear()} Nostalgia del paraíso</span>
        </div>
      </footer>
    </>
  );
}
