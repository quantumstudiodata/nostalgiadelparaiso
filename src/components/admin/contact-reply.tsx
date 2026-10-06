"use client";

import { useActionState, useState } from "react";
import { replyToContact, type ReplyState } from "@/app/actions/contact-reply";

/** "Responder" under a message from "Escríbenos". Follow-ups continue in Gmail. */
export function ContactReply({ messageId, name, repliedAt }: { messageId: string; name: string; repliedAt: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ReplyState, FormData>(replyToContact.bind(null, messageId), {});

  if (state.ok) {
    return <p className="mt-2 text-[13px] text-[#1f5c2a]" role="status">✓ Respuesta enviada a {name}. Si te contesta, te llegará a Gmail.</p>;
  }

  return (
    <div className="mt-2">
      {repliedAt && !open && <p className="text-[12px] text-[#1f5c2a]">✓ Respondido el {repliedAt}</p>}
      {open ? (
        <form action={action} className="mt-2 flex flex-col gap-2">
          <textarea
            name="reply"
            rows={5}
            required
            autoFocus
            placeholder={`Escribe tu respuesta para ${name}…`}
            className="w-full border border-mist rounded-md px-3 py-2 text-[14px]"
          />
          {state.error && <p className="text-[13px] text-red-700" role="alert">{state.error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="bg-ink text-white rounded-full px-4 py-1.5 text-[13px] disabled:opacity-60">
              {pending ? "Enviando..." : "Enviar respuesta"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="border border-ink rounded-full px-4 py-1.5 text-[13px]">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="mt-1 border border-ink rounded-full px-3.5 py-1 text-[13px] hover:bg-ink hover:text-white">
          {repliedAt ? "Responder de nuevo" : "Responder"}
        </button>
      )}
    </div>
  );
}
