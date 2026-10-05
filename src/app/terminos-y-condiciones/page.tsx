import { LegalPage } from "@/components/site/legal-page";

export const metadata = { title: "Términos y Condiciones · Nostalgia del paraíso" };

export default function TermsPage() {
  return (
    <LegalPage title="Términos y Condiciones">
      <h2>Uso del contenido</h2>
      <p>
        El contenido de Nostalgia del Paraíso está destinado exclusivamente a fines personales, informativos y literarios. No está permitido
        copiar, distribuir, modificar o utilizar los textos con fines comerciales o editoriales sin permiso.
      </p>

      <h2>Colaboraciones y textos de terceros</h2>
      <p>
        Algunos textos pueden ser escritos por autores invitados. En esos casos, los derechos de autor pertenecen al respectivo autor, y se
        publican con su consentimiento.
      </p>
      <p>La autoría siempre será reconocida y respetada.</p>

      <h2>Comentarios y participación</h2>
      <p>
        Se permite la participación mediante comentarios, siempre que se mantenga un lenguaje respetuoso. Nos reservamos el derecho de moderar,
        editar o eliminar cualquier comentario ofensivo, spam o que vulnere la integridad del blog o sus autores.
      </p>

      <h2>Enlaces externos</h2>
      <p>
        Este sitio puede contener enlaces a otras páginas web. No nos hacemos responsables por el contenido, políticas o prácticas de terceros.
      </p>
    </LegalPage>
  );
}
