"use client";

import { useActionState, useState, useTransition } from "react";
import {
  register,
  verifyRegistration,
  requestPasswordReset,
  resetPassword,
  resendCode,
  type FormState,
} from "@/app/actions/community";

const input = "h-11 border border-neutral-300 rounded-md px-3 text-sm w-full";
const button = "h-11 bg-ink text-white rounded-full text-sm font-medium mt-1 disabled:opacity-60";

function Field({ id, label, ...props }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium">{label}</label>
      <input id={id} className={input} {...props} />
    </div>
  );
}

function Feedback({ state }: { state: FormState }) {
  if (state.error) return <p className="text-sm text-red-700" role="alert">{state.error}</p>;
  if (state.message) return <p className="text-sm text-[#1f5c2a]" role="status">{state.message}</p>;
  return null;
}

/** Live checklist under the new-password fields. */
function PasswordChecklist({ password, confirm }: { password: string; confirm: string }) {
  const rules = [
    { ok: password.length >= 8, text: "Mínimo 8 caracteres" },
    { ok: /[A-Za-zÀ-ÿ]/.test(password) && /\d/.test(password), text: "Letras y al menos un número" },
    { ok: password.length > 0 && password === confirm, text: "Las dos contraseñas coinciden" },
  ];
  return (
    <ul className="text-xs flex flex-col gap-1 -mt-1">
      {rules.map((r) => (
        <li key={r.text} className={r.ok ? "text-[#1f5c2a]" : "text-neutral-500"}>
          {r.ok ? "✓" : "○"} {r.text}
        </li>
      ))}
    </ul>
  );
}

function NewPasswordFields() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  return (
    <>
      <Field id="pw-new" name="password" label="Contraseña" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Field id="pw-confirm" name="confirm" label="Repite la contraseña" type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <PasswordChecklist password={password} confirm={confirm} />
    </>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(register, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field id="reg-name" name="name" label="Nombre" required autoComplete="name" />
      <Field id="reg-email" name="email" label="Correo electrónico" type="email" required autoComplete="email" />
      <NewPasswordFields />
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={button}>{pending ? "Creando cuenta..." : "Crear cuenta"}</button>
    </form>
  );
}

function ResendButton({ purpose, email }: { purpose: "register" | "reset"; email: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <p className="text-[13px] text-neutral-600 text-center">
      ¿No te llegó?{" "}
      <button type="button" disabled={pending} onClick={() => start(async () => setMsg((await resendCode(purpose, email)).message ?? null))} className="underline underline-offset-4">
        Reenviar código
      </button>
      {msg && <span className="block mt-1 text-[#1f5c2a]">{msg}</span>}
    </p>
  );
}

export function VerifyForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(verifyRegistration, {});
  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <Field id="code" name="code" label="Código de 6 dígitos" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required className={`${input} text-center text-xl tracking-[0.4em] font-mono`} />
        <Feedback state={state} />
        <button type="submit" disabled={pending} className={button}>{pending ? "Verificando..." : "Confirmar correo"}</button>
      </form>
      <ResendButton purpose="register" email={email} />
    </div>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestPasswordReset, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field id="fg-email" name="email" label="Correo de tu cuenta" type="email" required autoComplete="email" />
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={button}>{pending ? "Enviando..." : "Enviarme un código"}</button>
    </form>
  );
}

export function ResetForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(resetPassword, {});
  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <Field id="rs-code" name="code" label="Código que te enviamos" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required className={`${input} text-center text-xl tracking-[0.4em] font-mono`} />
        <NewPasswordFields />
        <Feedback state={state} />
        <button type="submit" disabled={pending} className={button}>{pending ? "Guardando..." : "Cambiar contraseña"}</button>
      </form>
      <ResendButton purpose="reset" email={email} />
    </div>
  );
}
