import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendCode } from "@/lib/codes";
import { AuthShell } from "@/components/site/auth-shell";

async function login(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  // Right password but email never confirmed: send a fresh code instead of a generic error.
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerified && (await bcrypt.compare(password, user.passwordHash))) {
    await sendCode(email, "register");
    redirect(`/registro/verificar?email=${encodeURIComponent(email)}`);
  }

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
  searchParams: Promise<{ error?: string; verificada?: string }>;
}) {
  const { error, verificada } = await searchParams;

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
        {verificada && <p className="text-sm text-[#1f5c2a]" role="status">¡Correo confirmado! Ya puedes iniciar sesión.</p>}
        {error && <p className="text-sm text-red-700" role="alert">Correo o contraseña incorrectos.</p>}
        <Link href="/recuperar" className="-mt-1 text-[13px] underline underline-offset-4 self-end">
          ¿Olvidaste tu contraseña?
        </Link>
        <button type="submit" className="h-11 bg-ink text-white rounded-full text-sm font-medium mt-1">
          Iniciar sesión
        </button>
      </form>
      <p className="mt-5 text-sm text-neutral-600 text-center">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-ink font-medium underline underline-offset-4">
          Regístrate
        </Link>
      </p>
    </AuthShell>
  );
}
