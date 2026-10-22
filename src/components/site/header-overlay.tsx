"use client";

import { useEffect, useState } from "react";

/** Fixed header over a cover photo: transparent at the top, solid (white) once the page scrolls. */
export function HeaderOverlay({ children }: { children: React.ReactNode }) {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const update = () => setSolid(window.scrollY > 60);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div data-solid={solid} className="group fixed top-0 inset-x-0 z-40">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 to-transparent transition-opacity group-data-[solid=true]:opacity-0" />
      {children}
    </div>
  );
}
