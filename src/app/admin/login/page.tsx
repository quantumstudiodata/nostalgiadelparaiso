import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { AuthShell } from "@/components/site/auth-shell";

async function login(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  try {
    // /admin sends readers back to the home page; writers and managers stay in the panel.
    await signIn("credentials", { email, password, redirectTo: "/admin" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/login?error=1");
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell title="Iniciar sesión" subtitle="Entra con tu correo y contraseña.">
      <form action={login} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="text-[13px] font-medium">Correo electrónico</label>
          <input id="login-email" type="email" name="email" required autoComplete="email" className="h-11 border border-neutral-300 rounded-md px-3 text-sm" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-password" className="text-[13px] font-medium">Contraseña</label>
          <input id="login-password" type="password" name="password" required autoComplete="current-password" className="h-11 border border-neutral-300 rounded-md px-3 text-sm" />
        </div>
        {error && <p className="text-sm text-red-700" role="alert">Correo o contraseña incorrectos.</p>}
        <button type="submit" className="h-11 bg-ink text-white rounded-full text-sm font-medium mt-1">
          Iniciar sesión
        </button>
      </form>
      <p className="mt-4 text-[13px] text-neutral-600 text-center">
        ¿Olvidaste tu contraseña? Pídele a la administradora del sitio que te asigne una nueva desde el panel.
      </p>
      <p className="mt-3 text-sm text-neutral-600 text-center">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-ink font-medium underline underline-offset-4">
          Regístrate
        </Link>
      </p>
    </AuthShell>
  );
}
