import { useEffect, useState } from "react";
import "./PoliticaPrivacidad.css";

const sections = [
  {
    title: "Responsable del Tratamiento",
    content: (
      <>
        <p>
          <strong>Walk App</strong> es responsable del tratamiento de los datos personales que usted
          nos proporciona a través de nuestra plataforma web y móvil, enfocada en rutas de senderismo
          en la región de Popayán y el departamento del Cauca, Colombia.
        </p>
        <div className="priv-highlight">
          <p>
            📧 Correo de contacto: <strong>contacto@walkapp.com</strong><br />
            🌍 Aplicable a residentes en Colombia bajo la <strong>Ley 1581 de 2012</strong> y sus decretos reglamentarios.
          </p>
        </div>
      </>
    ),
  },
  {
    title: "Datos que Recopilamos",
    content: (
      <>
        <p>Recopilamos los siguientes tipos de información cuando usted utiliza Walk App:</p>
        <ul>
          <li><strong>Datos de registro:</strong> nombre de usuario, correo electrónico y contraseña (cifrada).</li>
          <li><strong>Datos de perfil:</strong> foto de perfil e información que usted agregue voluntariamente.</li>
          <li><strong>Datos de ubicación:</strong> coordenadas GPS durante el rastreo activo de rutas (solo con su consentimiento explícito).</li>
          <li><strong>Contenido generado:</strong> publicaciones en la comunidad, comentarios, likes y rutas creadas.</li>
          <li><strong>Datos de uso:</strong> historial de juegos (Trivia Popayán, Mapa Roto), ranking y recorridos completados.</li>
          <li><strong>Datos técnicos:</strong> dirección IP, tipo de dispositivo y navegador para fines de seguridad.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Finalidad del Tratamiento",
    content: (
      <>
        <p>Usamos sus datos exclusivamente para:</p>
        <ul>
          <li>Gestionar su cuenta y autenticación segura en la plataforma.</li>
          <li>Mostrar y registrar rutas de senderismo personalizadas.</li>
          <li>Habilitar las funciones de comunidad (publicaciones, comentarios y notificaciones).</li>
          <li>Calcular su posición en el ranking y guardar su historial de juegos.</li>
          <li>Enviar correos de activación de cuenta o recuperación de contraseña.</li>
          <li>Mejorar la experiencia de usuario y detectar fallos técnicos.</li>
        </ul>
        <p>No utilizamos sus datos para publicidad de terceros ni los compartimos con fines comerciales.</p>
      </>
    ),
  },
  {
    title: "Datos de Ubicación y Botón SOS",
    content: (
      <>
        <p>
          Walk App accede a su ubicación GPS <strong>únicamente durante un recorrido activo</strong> y
          con su consentimiento previo.
        </p>
        <div className="priv-highlight priv-highlight--warning">
          <p>
            ⚠️ <strong>Botón SOS:</strong> Al activarlo, su ubicación en tiempo real podrá ser
            compartida para fines de emergencia. Al usar esta función usted autoriza expresamente dicha transmisión.
          </p>
        </div>
        <p>Puede revocar el permiso de ubicación en cualquier momento desde la configuración de su dispositivo.</p>
      </>
    ),
  },
  {
    title: "Compartición de Datos",
    content: (
      <>
        <p>Sus datos personales <strong>no son vendidos ni cedidos</strong> a terceros. Solo podrían compartirse:</p>
        <ul>
          <li>Con proveedores técnicos que alojan la plataforma (bajo acuerdos de confidencialidad).</li>
          <li>Cuando sea requerido por autoridades competentes conforme a la ley colombiana.</li>
          <li>Para proteger la seguridad de otros usuarios de la plataforma.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Sus Derechos",
    content: (
      <>
        <p>De acuerdo con la Ley 1581 de 2012, usted tiene derecho a:</p>
        <ul>
          <li><strong>Conocer</strong> qué datos personales suyos tratamos.</li>
          <li><strong>Actualizar o corregir</strong> sus datos desde su perfil o contactándonos.</li>
          <li><strong>Solicitar la supresión</strong> de sus datos cuando no sean necesarios.</li>
          <li><strong>Revocar el consentimiento</strong> para el tratamiento en cualquier momento.</li>
          <li><strong>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC).</li>
        </ul>
        <p>Para ejercer estos derechos, escríbanos a <strong>contacto@walkapp.com</strong>.</p>
      </>
    ),
  },
  {
    title: "Seguridad de los Datos",
    content: (
      <>
        <p>
          Implementamos cifrado de contraseñas, tokens de autenticación seguros y activación de cuenta
          por correo electrónico verificado. Le recomendamos usar contraseñas únicas y no compartir
          sus credenciales.
        </p>
      </>
    ),
  },
  {
    title: "Cambios en esta Política",
    content: (
      <>
        <p>
          Nos reservamos el derecho de actualizar esta Política. Ante cambios significativos, lo
          notificaremos por correo electrónico o mediante un aviso en la plataforma.
        </p>
      </>
    ),
  },
];

export default function PoliticaPrivacidad() {
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const observers = [];
    sections.forEach((_, i) => {
      const el = document.getElementById(`section-${i}`);
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
    <div className="privacidad-root">
      <div className="priv-hero">
        <div className="priv-badge">Walk App · Legal</div>
        <h1 className="priv-title">Política de Privacidad</h1>
        <p className="priv-subtitle">
          Tu información es tuya. Aquí te explicamos con claridad cómo la usamos y protegemos.
        </p>
        <div className="priv-date">📅 Última actualización: Abril 2026</div>
      </div>

      <div className="priv-content">
        <div className="priv-toc">
          <h3>Contenido</h3>
          <ol>
            {sections.map((s, i) => (
              <li
                key={i}
                onClick={() =>
                  document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {s.title}
              </li>
            ))}
          </ol>
        </div>

        {sections.map((s, i) => (
          <div key={i}>
            <div
              id={`section-${i}`}
              className={`priv-section ${visibleSections.has(i) ? "visible" : ""}`}
            >
              <div className="priv-section-header">
                <div className="priv-num">{i + 1}</div>
                <h2>{s.title}</h2>
              </div>
              {s.content}
            </div>
            <div className="priv-divider" />
          </div>
        ))}

        <div className="priv-footer-note">
          <p>¿Tienes preguntas sobre el manejo de tus datos?</p>
          <a href="mailto:contacto@walkapp.com">contacto@walkapp.com</a>
          <p className="priv-footer-legal">
            Esta política aplica en Colombia conforme a la Ley 1581 de 2012.
          </p>
        </div>
      </div>
    </div>
  );
}