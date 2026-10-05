import Image from "next/image";

export function SiteFooter() {
  return (
    <>
      <section id="contacto" className="bg-lilac px-6 md:px-14 py-20">
        <div className="max-w-[1168px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          <h2 className="md:col-span-5 font-serif font-semibold text-4xl md:text-[52px] leading-[1.05]">
            Escríbenos. La palabra es tuya, mía y de todos.
          </h2>
          <form className="md:col-start-7 md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contacto-nombre" className="text-sm font-medium">Nombre</label>
              <input id="contacto-nombre" className="h-12 rounded-md bg-white px-3.5 text-[15px]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contacto-email" className="text-sm font-medium">Email</label>
              <input id="contacto-email" type="email" className="h-12 rounded-md bg-white px-3.5 text-[15px]" />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label htmlFor="contacto-mensaje" className="text-sm font-medium">Mensaje</label>
              <textarea id="contacto-mensaje" rows={4} className="rounded-md bg-white px-3.5 py-3 text-[15px]" />
            </div>
            <button type="submit" className="sm:col-span-2 justify-self-start bg-ink text-white rounded-full px-8 py-4 text-[15px] font-medium">
              Enviar mensaje
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-ink text-white px-6 md:px-14 py-10">
        <div className="max-w-[1168px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Image src="/images/logo-blanco.png" alt="Nostalgia del paraíso" width={540} height={244} className="h-12 w-auto" />
          <div className="flex gap-7 text-sm">
            <a href="#">Términos y Condiciones</a>
            <a href="#">Política de Privacidad</a>
          </div>
          <span className="text-sm text-neutral-300">© {new Date().getFullYear()} Nostalgia del paraíso</span>
        </div>
      </footer>
    </>
  );
}
