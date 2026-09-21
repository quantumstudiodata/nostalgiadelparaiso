export function SiteFooter() {
  return (
    <>
      <section className="bg-lilac py-16 px-6">
        <h2 className="font-serif text-2xl text-center mb-10">Contáctanos</h2>
        <form className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-neutral-600 mb-1.5">Nombre</label>
            <input className="w-full border-b border-neutral-500 bg-transparent py-1.5 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1.5">Apellido</label>
            <input className="w-full border-b border-neutral-500 bg-transparent py-1.5 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1.5">Email *</label>
            <input type="email" className="w-full border-b border-neutral-500 bg-transparent py-1.5 text-sm outline-none" />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1.5">Déjanos un mensaje...</label>
            <input className="w-full border-b border-neutral-500 bg-transparent py-1.5 text-sm outline-none" />
          </div>
          <div className="sm:col-span-2 flex justify-center mt-2">
            <button
              type="submit"
              className="bg-ink text-white text-sm px-8 py-2.5 rounded-sm"
            >
              Enviar
            </button>
          </div>
        </form>
      </section>

      <footer className="bg-ink text-white py-6 px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="font-serif text-sm text-center sm:text-left">
          Nostalgia
          <br />
          del paraíso
        </div>
        <div className="flex gap-6 text-xs text-neutral-300">
          <a href="#">Términos y Condiciones</a>
          <a href="#">Política de Privacidad</a>
        </div>
        <div className="text-xs text-neutral-400">
          © {new Date().getFullYear()} Nostalgia del paraíso. Todos los derechos reservados.
        </div>
      </footer>
    </>
  );
}
