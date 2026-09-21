import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

async function login(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-serif text-2xl leading-tight">
            Nostalgia
            <br />
            del paraíso
          </div>
          <div className="text-xs uppercase tracking-wide text-neutral-500 mt-2">
            Panel de edición
          </div>
        </div>

        <form action={login} className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-neutral-500 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              Correo o contraseña incorrectos.
            </p>
          )}

          <button
            type="submit"
            className="bg-ink text-white rounded-lg py-2.5 text-sm font-medium mt-2"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
