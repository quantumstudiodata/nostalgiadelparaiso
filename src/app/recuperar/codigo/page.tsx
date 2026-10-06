import { AuthShell } from "@/components/site/auth-shell";
import { ResetForm } from "@/components/site/auth-forms";

export const metadata = { title: "Nueva contraseña" };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams;
  return (
    <AuthShell title="Elige una nueva contraseña" subtitle={`Si ${email || "ese correo"} tiene una cuenta, te enviamos un código de 6 dígitos.`}>
      <ResetForm email={email} />
    </AuthShell>
  );
}
