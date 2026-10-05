"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/app/actions/community";

export function CommentForm({ action }: { action: (prev: FormState, formData: FormData) => Promise<FormState> }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2.5">
      <label htmlFor="comment-body" className="text-sm font-medium">Deja un comentario</label>
      <textarea id="comment-body" name="body" required rows={4} maxLength={3000} className="border border-mist rounded-lg px-3 py-2.5 text-[15px]" />
      {state.error && <p className="text-sm text-red-700" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending} className="self-start bg-ink text-white rounded-full px-6 py-2.5 text-sm font-medium disabled:opacity-60">
        {pending ? "Publicando..." : "Publicar comentario"}
      </button>
    </form>
  );
}
