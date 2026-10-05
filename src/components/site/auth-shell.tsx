import Link from "next/link";
import Image from "next/image";

/** Centered card used by the sign-in and sign-up pages. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-lilac px-4 py-12">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="flex justify-center mb-8">
          <Image src="/images/logo.png" alt="Nostalgia del paraíso" width={431} height={178} className="h-14 w-auto" priority />
        </Link>
        <div className="bg-white rounded-[10px] p-7">
          <h1 className="font-serif font-semibold text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
