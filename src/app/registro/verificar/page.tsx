import { AuthShell } from "@/components/site/auth-shell";
import { VerifyForm } from "@/components/site/auth-forms";

export const metadata = { title: "Confirma tu correo" };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams;
  return (
    <AuthShell title="Revisa tu correo" subtitle={`Te enviamos un código de 6 dígitos a ${email || "tu correo"}. Escríbelo aquí para activar tu cuenta.`}>
      <VerifyForm email={email} />
    </AuthShell>
  );
}
