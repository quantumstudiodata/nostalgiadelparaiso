import Link from "next/link";
import { AuthShell } from "@/components/site/auth-shell";
import { ForgotForm } from "@/components/site/auth-forms";

export const metadata = { title: "Recuperar contraseña · Nostalgia del paraíso" };

export default function ForgotPage() {
  return (
    <AuthShell title="¿Olvidaste tu contraseña?" subtitle="Escribe el correo de tu cuenta y te enviaremos un código para elegir una nueva.">
      <ForgotForm />
      <p className="mt-5 text-sm text-center">
        <Link href="/admin/login" className="underline underline-offset-4">Volver a iniciar sesión</Link>
      </p>
    </AuthShell>
  );
}
