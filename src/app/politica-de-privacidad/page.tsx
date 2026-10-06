import { LegalPage } from "@/components/site/legal-page";

export const metadata = { title: "Política de Privacidad" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de Privacidad">
      <p>
        En Nostalgia del Paraíso, la privacidad de nuestros lectores y visitantes es muy importante. A continuación, te explicamos cómo
        recopilamos, usamos y protegemos tu información personal.
      </p>

      <h2>1. Recopilación de información</h2>
      <p>Este sitio web puede recopilar información personal como:</p>
      <ul>
        <li>Nombre y dirección de correo electrónico, a través del formulario de suscripción o contacto.</li>
        <li>
          Información técnica de navegación (como tipo de navegador, IP y páginas visitadas), mediante cookies y herramientas de análisis web.
        </li>
      </ul>

      <h2>2. Uso de la información</h2>
      <p>La información recopilada se utiliza únicamente para:</p>
      <ul>
        <li>Enviar correos electrónicos con nuevos textos, actualizaciones o contenido del blog (si te suscribes).</li>
        <li>Mejorar la experiencia del usuario y el rendimiento del sitio web.</li>
        <li>Responder a consultas o mensajes enviados a través del formulario de contacto.</li>
      </ul>
      <p>Nostalgia del Paraíso no comparte, vende ni transfiere tu información personal a terceros, salvo requerimiento legal.</p>

      <h2>3. Uso de Cookies</h2>
      <p>
        Este sitio puede utilizar cookies para recopilar datos anónimos de navegación. Puedes configurar tu navegador para rechazarlas, aunque
        esto podría afectar la funcionalidad del sitio.
      </p>

      <h2>4. Protección de datos</h2>
      <p>
        Se toman medidas razonables para proteger la información personal recopilada, aunque ningún método de transmisión por Internet es 100%
        seguro.
      </p>

      <h2>5. Cambios en la política</h2>
      <p>
        Esta Política de Privacidad puede ser actualizada en cualquier momento. Las modificaciones serán publicadas en esta misma página.
      </p>
    </LegalPage>
  );
}
