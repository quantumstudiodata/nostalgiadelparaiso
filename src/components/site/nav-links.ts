export type NavItem = { key: string; href: string; label: string };

export const DEFAULT_NAV: NavItem[] = [
  { key: "inicio", href: "/", label: "Inicio" },
  { key: "entradas", href: "/blog", label: "Entradas" },
  { key: "talleres", href: "/#talleres", label: "Talleres" },
  { key: "acerca", href: "/acerca-de-nosotros", label: "Acerca de" },
  { key: "contacto", href: "#contacto", label: "Contacto" },
];

/** Applies the labels saved in the "site.nav" block (editable in edit mode). */
export function navWithLabels(labels: Record<string, string | undefined>): NavItem[] {
  return DEFAULT_NAV.map((item) => ({ ...item, label: labels[item.key]?.trim() || item.label }));
}
