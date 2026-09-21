# Nostalgia del paraíso

Sitio propio (reemplazo de Wix) con un panel de administración donde la
clienta puede publicar entradas de blog y editar los textos fijos del sitio
sin poder modificar la estructura ni el diseño.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- NextAuth (credenciales) con roles `ADMIN` / `EDITOR`

## Desarrollo local

1. Copia `.env.example` a `.env` y completa `DATABASE_URL` (Postgres) y
   `AUTH_SECRET`.
2. Instala dependencias:

   ```bash
   npm install
   ```

3. Aplica las migraciones y siembra datos de ejemplo:

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

   El seed crea dos usuarios:
   - `admin@nostalgiadelparaiso.com` / `changeme-admin` (rol admin)
   - `angeles@nostalgiadelparaiso.com` / `changeme-editora` (rol editor,
     la clienta)

   **Cambia estas contraseñas antes de usarlo en producción.**

4. Levanta el servidor:

   ```bash
   npm run dev
   ```

   - Sitio público: http://localhost:3000
   - Panel de administración: http://localhost:3000/admin/login

## Estructura

- `src/app/(site)` — páginas públicas (home, blog, acerca de nosotros).
- `src/app/admin` — panel de administración, protegido por middleware
  (`src/proxy.ts`) y NextAuth.
- `prisma/schema.prisma` — modelos: `User`, `Category`, `Post`,
  `SiteBlock` (bloques de texto fijos editables desde `/admin/textos`).

## Roles

- **ADMIN**: acceso completo (uso interno de la agencia).
- **EDITOR**: rol de la clienta. Puede crear/editar/eliminar entradas y
  editar los campos de texto/imagen de los bloques fijos del sitio
  (`SiteBlock`), pero no puede agregar, quitar o reordenar secciones ni
  tocar estilos — eso vive en el código.
