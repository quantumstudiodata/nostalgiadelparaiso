import Image from "next/image";

export function SiteFooter() {
  return (
    <>
      <section className="bg-lilac pt-5 pb-24 px-6">
        <div className="site-container">
          <h2 className="font-serif font-bold text-[28px] text-center mb-14">Contáctanos</h2>
          <form className="max-w-[700px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-8">
            <div>
              <label className="block text-[15px] mb-2">Nombre</label>
              <input className="w-full border-b border-neutral-700 bg-transparent py-1.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[15px] mb-2">Apellido</label>
              <input className="w-full border-b border-neutral-700 bg-transparent py-1.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[15px] mb-2">Email *</label>
              <input type="email" className="w-full border-b border-neutral-700 bg-transparent py-1.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[15px] mb-2">Déjanos un mensaje...</label>
              <input className="w-full border-b border-neutral-700 bg-transparent py-1.5 text-sm outline-none" />
            </div>
            <div className="sm:col-span-2 flex justify-center">
              <button type="submit" className="bg-ink text-white text-[15px] w-[170px] py-3 sm:ml-[50px]">
                Enviar
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer className="bg-ink text-white py-6 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center gap-5 md:gap-16">
          <Image
            src="/images/logo-blanco.png"
            alt="Nostalgia del paraíso"
            width={540}
            height={244}
            className="h-12 w-auto md:ml-[150px]"
          />
          <div className="flex flex-col items-center gap-4 text-[15px]">
            <div className="flex gap-7">
              <a href="#">Términos y Condiciones</a>
              <a href="#">Política de Privacidad</a>
            </div>
            <div className="text-center">
              © {new Date().getFullYear()} Nostalgia del paraíso. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
