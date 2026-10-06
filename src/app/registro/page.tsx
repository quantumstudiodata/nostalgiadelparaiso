import Link from "next/link";
import { AuthShell } from "@/components/site/auth-shell";
import { RegisterForm } from "@/components/site/auth-forms";

export const metadata = { title: "Crear cuenta · Nostalgia del paraíso" };

export default function RegisterPage() {
  return (
    <AuthShell title="Crear cuenta" subtitle="Recibe por correo cada entrada nueva y comenta los textos.">
      <RegisterForm />
      <p className="mt-5 text-sm text-neutral-600 text-center">
        ¿Ya tienes cuenta?{" "}
        <Link href="/admin/login" className="text-ink font-medium underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
