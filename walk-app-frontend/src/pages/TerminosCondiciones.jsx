import { useEffect, useState } from "react";
import "./TerminosCondiciones.css";

const sections = [
  {
    icon: "🗺️",
    title: "Aceptación de los Términos",
    content: (
      <>
        <p>
          Al registrarse, acceder o utilizar Walk App, usted acepta quedar vinculado por estos
          Términos y Condiciones. Si no está de acuerdo con alguna parte, le rogamos que no
          utilice la plataforma.
        </p>
        <p>
          Walk App es una plataforma de senderismo digital enfocada en rutas del departamento
          del Cauca, Colombia. Incluye funciones de comunidad, juegos educativos y seguimiento
          de recorridos.
        </p>
      </>
    ),
  },
  {
    icon: "👤",
    title: "Registro y Cuentas de Usuario",
    content: (
      <>
        <p>
          Para acceder a las funciones de Walk App, deberá crear una cuenta proporcionando
          información veraz y actualizada. Usted es responsable de:
        </p>
        <ul>
          <li>Mantener la confidencialidad de su contraseña.</li>
          <li>Todas las actividades que ocurran bajo su cuenta.</li>
          <li>Notificarnos inmediatamente ante cualquier uso no autorizado.</li>
          <li>Activar su cuenta a través del correo de verificación enviado al registrarse.</li>
        </ul>
        <div className="term-note">
          <p>
            📌 No está permitido crear cuentas falsas, suplantar identidades ni registrarse
            en nombre de otra persona sin su consentimiento.
          </p>
        </div>
      </>
    ),
  },
  {
    icon: "🌿",
    title: "Uso Aceptable de la Plataforma",
    content: (
      <>
        <p>Usted se compromete a utilizar Walk App de forma responsable. Está <strong>prohibido</strong>:</p>
        <ul>
          <li>Publicar contenido ofensivo, discriminatorio, violento o ilegal en la comunidad.</li>
          <li>Hostigar, amenazar o intimidar a otros usuarios.</li>
          <li>Compartir información falsa sobre rutas que pueda poner en riesgo la seguridad de otros.</li>
          <li>Usar la plataforma para actividades comerciales no autorizadas.</li>
          <li>Intentar acceder a cuentas ajenas o vulnerar la seguridad del sistema.</li>
          <li>Usar bots, scripts o herramientas automatizadas para interactuar con la plataforma.</li>
        </ul>
      </>
    ),
  },
  {
    icon: "📍",
    title: "Rutas y Contenido Generado por Usuarios",
    content: (
      <>
        <p>
          Los usuarios pueden crear y compartir rutas de senderismo. Al crear una ruta, usted
          garantiza que la información es precisa y que tiene el derecho de compartirla.
        </p>
        <div className="term-warning">
          <p>
            ⚠️ <strong>Aviso de seguridad:</strong> Walk App no verifica presencialmente las rutas
            publicadas por usuarios. Siempre evalúe su capacidad física y las condiciones climáticas
            antes de emprender cualquier recorrido.
          </p>
        </div>
        <p>
          Walk App se reserva el derecho de eliminar rutas que contengan información errónea,
          peligrosa o que violen estos términos.
        </p>
      </>
    ),
  },
  {
    icon: "🆘",
    title: "Botón SOS y Limitación de Responsabilidad",
    content: (
      <>
        <p>
          El botón SOS es una herramienta de auxilio digital. Al activarlo, su ubicación puede
          ser compartida para facilitar una respuesta de emergencia.
        </p>
        <div className="term-warning">
          <p>
            ⚠️ <strong>Importante:</strong> Walk App <strong>no es un servicio de emergencias oficial</strong>.
            En caso de emergencia real, contacte siempre los servicios de rescate (Línea 123 en Colombia).
            El botón SOS es un apoyo complementario, no un sustituto.
          </p>
        </div>
        <p>
          Walk App no se hace responsable por daños, lesiones o pérdidas derivadas del uso de
          las rutas publicadas en la plataforma.
        </p>
      </>
    ),
  },
  {
    icon: "🎮",
    title: "Juegos y Ranking",
    content: (
      <>
        <p>
          Walk App incluye juegos educativos (Trivia Popayán y Mapa Roto) y un sistema de ranking.
          Estos sistemas son de carácter recreativo y educativo.
        </p>
        <ul>
          <li>Los puntos y posiciones en el ranking no tienen valor monetario ni comercial.</li>
          <li>Walk App puede modificar el sistema de puntuación en cualquier momento.</li>
          <li>El uso de trampas o manipulación del sistema resultará en la suspensión de la cuenta.</li>
        </ul>
      </>
    ),
  },
  {
    icon: "©️",
    title: "Propiedad Intelectual",
    content: (
      <>
        <p>
          Todo el contenido propio de Walk App (diseño, imágenes, código, textos y juegos) está
          protegido por derechos de propiedad intelectual y no puede ser reproducido sin
          autorización expresa.
        </p>
        <p>
          Al publicar contenido en la plataforma, usted otorga a Walk App una licencia no exclusiva
          para mostrar dicho contenido dentro de la plataforma.
        </p>
      </>
    ),
  },
  {
    icon: "⚖️",
    title: "Ley Aplicable y Jurisdicción",
    content: (
      <>
        <p>
          Estos Términos se rigen por las leyes de la República de Colombia. Cualquier disputa
          será sometida a la jurisdicción de los tribunales competentes de la ciudad de Popayán, Cauca.
        </p>
      </>
    ),
  },
  {
    icon: "🔄",
    title: "Modificaciones",
    content: (
      <>
        <p>
          Walk App puede actualizar estos Términos periódicamente. Los cambios serán notificados
          por correo electrónico o mediante aviso en la plataforma. El uso continuado implica la
          aceptación de los nuevos términos.
        </p>
      </>
    ),
  },
];

export default function TerminosCondiciones() {
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const observers = [];
    sections.forEach((_, i) => {
      const el = document.getElementById(`term-section-${i}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting)
            setVisibleSections((prev) => new Set([...prev, i]));
        },
        { threshold: 0.1 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="terminos-root">
      <div className="term-hero">
        <div className="term-badge">Walk App · Legal</div>
        <h1 className="term-title">Términos y Condiciones</h1>
        <p className="term-subtitle">
          Las reglas que hacen posible una comunidad de caminantes segura y confiable.
        </p>
        <div className="term-date">📅 Última actualización: Abril 2026</div>
      </div>

      <div className="term-content">
        <div className="term-intro-box">
          Por favor lea estos términos con atención antes de usar Walk App. Al crear una cuenta o
          iniciar sesión, usted acepta las condiciones descritas a continuación. Dudas:{" "}
          <strong>contacto@walkapp.com</strong>
        </div>

        {sections.map((s, i) => (
          <div key={i}>
            <div
              id={`term-section-${i}`}
              className={`term-section ${visibleSections.has(i) ? "visible" : ""}`}
            >
              <div className="term-section-header">
                <span className="term-icon">{s.icon}</span>
                <h2>{s.title}</h2>
              </div>
              {s.content}
            </div>
            {i < sections.length - 1 && <div className="term-divider" />}
          </div>
        ))}

        <div className="term-footer">
          <h3>¿Tienes preguntas sobre estos términos?</h3>
          <p>Escríbenos y te responderemos a la brevedad.</p>
          <a href="mailto:contacto@walkapp.com">contacto@walkapp.com</a>
          <p className="term-footer-legal">
            Walk App · Popayán, Cauca, Colombia · Ley 1581 de 2012
          </p>
        </div>
      </div>
    </div>
  );
}